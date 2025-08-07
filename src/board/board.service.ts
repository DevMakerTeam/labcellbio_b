import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardResponseDto, BoardImageResponseDto } from './dto/board-response.dto';
import { PaginatedBoardResponseDto } from './dto/pagination.dto';
import { Upload } from '../uploads/uploads.entity';
import { BoardImage } from './board-image.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    @InjectRepository(BoardImage)
    private readonly boardImageRepository: Repository<BoardImage>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(page?: number, pageSize?: number): Promise<PaginatedBoardResponseDto> {
    // 기본값 설정
    const currentPage = page || 1;
    const currentPageSize = pageSize || 10;
    
    // 전체 게시글 수 조회
    const total = await this.boardRepository.count();
    
    // 페이지네이션 계산
    const skip = (currentPage - 1) * currentPageSize;
    const totalPages = Math.ceil(total / currentPageSize);
    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;
    
    // 페이지네이션된 게시글 조회
    const boards = await this.boardRepository.find({
      relations: ['boardImages', 'boardImages.upload'],
      order: { createdAt: 'DESC' }, // 최신 게시글부터
      skip,
      take: currentPageSize
    });
    
    const boardResponses = boards.map(board => {
      // isDeleted = false인 이미지만 필터링
      const activeBoardImages = board.boardImages?.filter(boardImage => 
        boardImage.upload && !boardImage.upload.isDeleted
      ) || [];
      
      const boardImages: BoardImageResponseDto[] = activeBoardImages.map(boardImage => ({
        id: boardImage.uploadId,
        fileUrl: boardImage.upload?.fileUrl || null
      }));
      
      return {
        id: board.id,
        author: board.author,
        authorImage: board.authorImage,
        title: board.title,
        description: board.description,
        content: board.content,
        thumbnail: board.thumbnail,
        boardImages,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      };
    });
    
    return {
      boards: boardResponses,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages,
      hasPrevious,
      hasNext
    };
  }

  async findOne(id: number): Promise<BoardResponseDto> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['boardImages', 'boardImages.upload']
    });
    
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    // isDeleted = false인 이미지만 필터링
    const activeBoardImages = board.boardImages?.filter(boardImage => 
      boardImage.upload && !boardImage.upload.isDeleted
    ) || [];
    
    // boardImages에서 id와 fileUrl만 선택하여 응답 DTO 형태로 변환
    const boardImages: BoardImageResponseDto[] = activeBoardImages.map(boardImage => ({
      id: boardImage.uploadId,
      fileUrl: boardImage.upload?.fileUrl || null
    }));
    
    return {
      id: board.id,
      author: board.author,
      authorImage: board.authorImage,
      title: board.title,
      description: board.description,
      content: board.content,
      thumbnail: board.thumbnail,
      boardImages,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };
  }

  async create(dto: CreateBoardDto): Promise<BoardResponseDto> {
    const { boardImages: uploadIds, ...boardData } = dto;
    const board = this.boardRepository.create(boardData);
    const savedBoard = await this.boardRepository.save(board);
    
    // thumbnail과 authorImage의 boardId 업데이트
    await this.updateImageBoardId(savedBoard);
    
    // 텍스트 에디터에서 업로드된 이미지들을 BoardImage에 연결
    if (uploadIds && uploadIds.length > 0) {
      await this.createBoardImages(savedBoard.id, uploadIds);
    }
    
    // 생성된 게시글을 다시 조회하여 boardImages 관계를 포함하여 반환
    const createdBoard = await this.boardRepository.findOne({
      where: { id: savedBoard.id },
      relations: ['boardImages', 'boardImages.upload']
    });
    
    if (!createdBoard) {
      throw new NotFoundException('생성된 게시글을 찾을 수 없습니다.');
    }
    
    // isDeleted = false인 이미지만 필터링
    const activeBoardImages = createdBoard.boardImages?.filter(boardImage => 
      boardImage.upload && !boardImage.upload.isDeleted
    ) || [];
    
    // boardImages에서 id와 fileUrl만 선택하여 응답 DTO 형태로 변환
    const boardImages: BoardImageResponseDto[] = activeBoardImages.map(boardImage => ({
      id: boardImage.uploadId,
      fileUrl: boardImage.upload?.fileUrl || null
    }));
    
    return {
      id: createdBoard.id,
      author: createdBoard.author,
      authorImage: createdBoard.authorImage,
      title: createdBoard.title,
      description: createdBoard.description,
      content: createdBoard.content,
      thumbnail: createdBoard.thumbnail,
      boardImages,
      createdAt: createdBoard.createdAt,
      updatedAt: createdBoard.updatedAt
    };
  }

  async update(id: number, dto: UpdateBoardDto): Promise<BoardResponseDto> {
    // 기존 게시글 조회 (썸네일과 작성자 이미지 URL 확인을 위해)
    const existingBoard = await this.boardRepository.findOne({
      where: { id },
      relations: ['boardImages', 'boardImages.upload']
    });
    
    if (!existingBoard) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    // 기존 썸네일이 있고, 새로운 썸네일로 변경되는 경우 기존 이미지 삭제
    if (existingBoard.thumbnail && dto.thumbnail && existingBoard.thumbnail !== dto.thumbnail) {
      try {
        const thumbnailKey = this.extractS3KeyFromUrl(existingBoard.thumbnail);
        if (thumbnailKey) {
          await this.s3Service.deleteFile(thumbnailKey);
          console.log(`기존 썸네일 이미지 삭제 완료: ${thumbnailKey}`);
        }
      } catch (error) {
        console.error(`기존 썸네일 이미지 S3 삭제 실패: ${existingBoard.thumbnail}`, error);
      }
    }
    
    // 기존 작성자 이미지가 있고, 새로운 작성자 이미지로 변경되는 경우 기존 이미지 삭제
    if (existingBoard.authorImage && dto.authorImage && existingBoard.authorImage !== dto.authorImage) {
      try {
        const authorImageKey = this.extractS3KeyFromUrl(existingBoard.authorImage);
        if (authorImageKey) {
          await this.s3Service.deleteFile(authorImageKey);
          console.log(`기존 작성자 이미지 삭제 완료: ${authorImageKey}`);
        }
      } catch (error) {
        console.error(`기존 작성자 이미지 S3 삭제 실패: ${existingBoard.authorImage}`, error);
      }
    }

    const { boardImages: uploadIds, ...updateData } = dto;
    await this.boardRepository.update(id, updateData);
    const updatedBoard = await this.boardRepository.findOne({
      where: { id },
      relations: ['boardImages', 'boardImages.upload']
    });
    
    if (!updatedBoard) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    // thumbnail과 authorImage의 boardId 업데이트
    await this.updateImageBoardId(updatedBoard);
    
    // 텍스트 에디터에서 업로드된 이미지들을 BoardImage에 연결
    if (uploadIds && Array.isArray(uploadIds)) {
      // 기존 BoardImage 연결들 조회
      const existingBoardImages = await this.boardImageRepository.find({
        where: { boardId: id }
      });
      
      // 기존 uploadId들과 새로운 uploadId들 비교
      const existingUploadIds = existingBoardImages.map(bi => bi.uploadId);
      const newUploadIds = uploadIds;
      
      // 제거될 uploadId들 (기존에 있지만 새로운 배열에 없는 것들)
      const removedUploadIds = existingUploadIds.filter(id => !newUploadIds.includes(id));
      
      // 제거될 이미지들 S3에서 삭제
      if (removedUploadIds.length > 0) {
        const uploadsToDelete = await this.uploadRepository.find({
          where: { id: In(removedUploadIds), isDeleted: false }
        });
        
        for (const upload of uploadsToDelete) {
          try {
            await this.s3Service.deleteFile(upload.s3Key);
            console.log(`제거된 텍스트 에디터 이미지 삭제 완료: ${upload.s3Key}`);
          } catch (error) {
            console.error(`제거된 텍스트 에디터 이미지 S3 삭제 실패: ${upload.s3Key}`, error);
          }
        }
        
        // DB에서 소프트 삭제
        await this.uploadRepository.update(
          { id: In(removedUploadIds) },
          { isDeleted: true }
        );
        console.log(`제거된 텍스트 에디터 이미지 DB 소프트 삭제 완료: uploadIds ${removedUploadIds.join(', ')}`);
      }
      
      // 기존 BoardImage 연결 삭제
      await this.boardImageRepository.delete({ boardId: id });
      
      // 새로운 BoardImage 연결 생성
      if (newUploadIds.length > 0) {
        await this.createBoardImages(id, newUploadIds);
      }
    }
    
    // isDeleted = false인 이미지만 필터링
    const activeBoardImages = updatedBoard.boardImages?.filter(boardImage => 
      boardImage.upload && !boardImage.upload.isDeleted
    ) || [];
    
    // 응답 DTO 형태로 변환하여 반환
    const boardImages: BoardImageResponseDto[] = activeBoardImages.map(boardImage => ({
      id: boardImage.uploadId,
      fileUrl: boardImage.upload?.fileUrl || null
    }));
    
    return {
      id: updatedBoard.id,
      author: updatedBoard.author,
      authorImage: updatedBoard.authorImage,
      title: updatedBoard.title,
      description: updatedBoard.description,
      content: updatedBoard.content,
      thumbnail: updatedBoard.thumbnail,
      boardImages,
      createdAt: updatedBoard.createdAt,
      updatedAt: updatedBoard.updatedAt
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    // 게시글 조회 (썸네일 URL과 작성자 이미지 URL 확인을 위해)
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 게시글에 연결된 이미지 관계들 조회
    const boardImages = await this.boardImageRepository.find({
      where: { boardId: id }
    });
    
    // boardId로 직접 연결된 업로드들 조회 (썸네일 포함)
    const directUploads = await this.uploadRepository.find({
      where: { boardId: id, isDeleted: false }
    });
    
    // 모든 관련 업로드 ID 수집
    const boardImageUploadIds = boardImages.map(bi => bi.uploadId);
    const directUploadIds = directUploads.map(upload => upload.id);
    const allUploadIds = [...new Set([...boardImageUploadIds, ...directUploadIds])];
    
    // 연결된 이미지들 삭제 (S3에서 실제 삭제 + DB 소프트 삭제)
    if (allUploadIds.length > 0) {
      // 업로드 정보 조회
      const uploads = await this.uploadRepository.find({
        where: { id: In(allUploadIds) }
      });
      
      // S3에서 파일 삭제
      for (const upload of uploads) {
        try {
          await this.s3Service.deleteFile(upload.s3Key);
        } catch (error) {
          console.error(`S3 파일 삭제 실패: ${upload.s3Key}`, error);
        }
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: In(allUploadIds) },
        { isDeleted: true }
      );
      
      // 관계 테이블에서도 삭제
      await this.boardImageRepository.delete({ boardId: id });
    }

    // Board 엔티티에 직접 저장된 이미지들 삭제 (썸네일, 작성자 이미지)
    const imagesToDelete = [];
    
    // 썸네일 이미지 삭제
    if (board.thumbnail) {
      try {
        const thumbnailKey = this.extractS3KeyFromUrl(board.thumbnail);
        if (thumbnailKey) {
          await this.s3Service.deleteFile(thumbnailKey);
          console.log(`썸네일 이미지 삭제 완료: ${thumbnailKey}`);
        }
      } catch (error) {
        console.error(`썸네일 이미지 삭제 실패: ${board.thumbnail}`, error);
      }
    }

    // 작성자 이미지 삭제
    if (board.authorImage) {
      try {
        const authorImageKey = this.extractS3KeyFromUrl(board.authorImage);
        if (authorImageKey) {
          await this.s3Service.deleteFile(authorImageKey);
          console.log(`작성자 이미지 삭제 완료: ${authorImageKey}`);
        }
      } catch (error) {
        console.error(`작성자 이미지 삭제 실패: ${board.authorImage}`, error);
      }
    }
    
    // 게시글 삭제
    const result = await this.boardRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    return { message: '게시글과 관련 이미지들이 성공적으로 삭제되었습니다.' };
  }

  /**
   * thumbnail과 authorImage의 boardId를 업데이트하는 메서드
   */
  private async updateImageBoardId(board: Board): Promise<void> {
    const imagesToUpdate: Array<{ s3Key: string; boardId: number }> = [];
    
    // thumbnail이 있으면 boardId 업데이트
    if (board.thumbnail) {
      const thumbnailKey = this.extractS3KeyFromUrl(board.thumbnail);
      if (thumbnailKey) {
        imagesToUpdate.push({ s3Key: thumbnailKey, boardId: board.id });
      }
    }
    
    // authorImage가 있으면 boardId 업데이트
    if (board.authorImage) {
      const authorImageKey = this.extractS3KeyFromUrl(board.authorImage);
      if (authorImageKey) {
        imagesToUpdate.push({ s3Key: authorImageKey, boardId: board.id });
      }
    }
    
    // uploads 테이블에서 해당 이미지들의 boardId 업데이트
    for (const image of imagesToUpdate) {
      try {
        await this.uploadRepository.update(
          { s3Key: image.s3Key },
          { boardId: image.boardId }
        );
        console.log(`이미지 boardId 업데이트 완료: ${image.s3Key} -> boardId: ${image.boardId}`);
      } catch (error) {
        console.error(`이미지 boardId 업데이트 실패: ${image.s3Key}`, error);
      }
    }
  }

  /**
   * S3 URL에서 S3 키를 추출하는 헬퍼 메서드
   * 예: https://bucket.s3.region.amazonaws.com/images/file.jpg -> images/file.jpg
   */
  private extractS3KeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // 첫 번째 슬래시 제거
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (error) {
      console.error('URL 파싱 실패:', url, error);
      return null;
    }
  }

  /**
   * 텍스트 에디터에서 업로드된 이미지들의 upload ID를 받아서 BoardImage에 연결하는 메서드
   */
  private async createBoardImages(boardId: number, uploadIds: number[]): Promise<void> {
    try {
      for (const uploadId of uploadIds) {
        // upload 테이블에서 해당 uploadId를 가진 레코드 찾기
        const upload = await this.uploadRepository.findOne({
          where: { id: uploadId, isDeleted: false }
        });

        if (upload) {
          // upload의 boardId 업데이트
          await this.uploadRepository.update(
            { id: uploadId },
            { boardId }
          );

          // BoardImage 테이블에 연결 생성
          await this.boardImageRepository.save({
            boardId,
            uploadId
          });

          console.log(`이미지 연결 완료: boardId ${boardId}, uploadId ${uploadId}`);
        } else {
          console.warn(`업로드 정보를 찾을 수 없음: uploadId ${uploadId}`);
        }
      }
    } catch (error) {
      console.error('BoardImage 생성 중 오류:', error);
    }
  }
}
