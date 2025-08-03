import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
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

  findAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  findOne(id: number): Promise<Board> {
    return this.boardRepository.findOneByOrFail({ id });
  }

  create(dto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create(dto);
    return this.boardRepository.save(board);
  }

  async update(id: number, dto: UpdateBoardDto): Promise<Board> {
    await this.boardRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    // 게시글 조회 (썸네일 URL 확인을 위해)
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
    
    // 게시글 삭제
    const result = await this.boardRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    return { message: '게시글과 관련 이미지들이 성공적으로 삭제되었습니다.' };
  }
}
