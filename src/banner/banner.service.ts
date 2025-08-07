import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Banner } from './banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Upload } from '../uploads/uploads.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    private readonly s3Service: S3Service,
  ) {}

  findAll(): Promise<Banner[]> {
    return this.bannerRepository.find({
      order: { 
        displayOrder: 'ASC',
        createdAt: 'ASC'  // displayOrder가 같으면 생성일시 순
      },
      relations: ['upload']
    });
  }

  findOne(id: number): Promise<Banner> {
    return this.bannerRepository.findOneOrFail({
      where: { id },
      relations: ['upload']
    });
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    console.log('배너 생성 시작:', dto);
    
    // displayOrder가 지정되지 않았으면 마지막 순서로 설정
    if (dto.displayOrder === undefined) {
      console.log('displayOrder가 지정되지 않음, 마지막 순서 계산 중...');
      const lastBanner = await this.bannerRepository
        .createQueryBuilder('banner')
        .orderBy('banner.displayOrder', 'DESC')
        .getOne();
      dto.displayOrder = lastBanner ? lastBanner.displayOrder + 1 : 1;
      console.log('계산된 displayOrder:', dto.displayOrder);
    }

    // bannerImage URL로 uploadId 찾기
    let uploadId: number | null = null;
    if (dto.bannerImage) {
      console.log('bannerImage URL로 upload 찾는 중:', dto.bannerImage);
      const uploads = await this.uploadRepository.find({
        where: { fileUrl: dto.bannerImage, isDeleted: false },
        take: 1
      });
      console.log('찾은 uploads:', uploads);
      if (uploads.length > 0) {
        uploadId = uploads[0].id;
        console.log('찾은 uploadId:', uploadId);
      } else {
        console.log('해당 fileUrl을 가진 upload를 찾을 수 없음');
      }
    }

    // 배너 생성
    console.log('배너 생성 데이터:', {
      title: dto.title,
      subTitle: dto.subTitle,
      bannerImage: dto.bannerImage,
      displayOrder: dto.displayOrder
    });
    
    const banner = this.bannerRepository.create({
      title: dto.title,
      subTitle: dto.subTitle,
      bannerImage: dto.bannerImage,
      displayOrder: dto.displayOrder
    });
    
    console.log('생성된 banner 객체:', banner);
    const savedBanner = await this.bannerRepository.save(banner);
    console.log('저장된 banner:', savedBanner);
    
    // upload 관계 설정 (uploadId가 있는 경우)
    if (uploadId) {
      await this.bannerRepository
        .createQueryBuilder()
        .update(Banner)
        .set({ upload: { id: uploadId } })
        .where("id = :id", { id: savedBanner.id })
        .execute();
      console.log(`배너와 업로드 연결 완료: bannerId ${savedBanner.id} -> uploadId ${uploadId}`);
    }
    
    // 관계 정보를 포함하여 반환
    return this.findOne(savedBanner.id);
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    // 기존 배너 조회 (upload 관계 포함)
    const existingBanner = await this.findOne(id);
    
    // 기존 이미지가 있고, 새로운 이미지로 변경되는 경우 기존 이미지 삭제
    if (existingBanner.upload && dto.bannerImage && existingBanner.bannerImage !== dto.bannerImage) {
      try {
        await this.s3Service.deleteFile(existingBanner.upload.s3Key);
        console.log(`기존 배너 이미지 삭제 완료: ${existingBanner.upload.s3Key}`);
      } catch (error) {
        console.error(`기존 배너 이미지 S3 삭제 실패: ${existingBanner.upload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: existingBanner.upload.id },
        { isDeleted: true }
      );
      console.log(`기존 배너 이미지 DB 소프트 삭제 완료: uploadId ${existingBanner.upload.id}`);
    }

    await this.bannerRepository.update(id, dto);
    const updatedBanner = await this.findOne(id);
    
    // bannerImage URL로 uploadId 찾아서 연결
    if (dto.bannerImage) {
      const uploads = await this.uploadRepository.find({
        where: { fileUrl: dto.bannerImage, isDeleted: false },
        take: 1
      });
      if (uploads.length > 0) {
        const upload = uploads[0];
        // 관계 설정을 위해 QueryBuilder 사용
        await this.bannerRepository
          .createQueryBuilder()
          .update(Banner)
          .set({ upload: { id: upload.id } })
          .where("id = :id", { id: updatedBanner.id })
          .execute();
        console.log(`배너와 업로드 연결 완료: bannerId ${updatedBanner.id} -> uploadId ${upload.id}`);
      }
    }
    
    return updatedBanner;
  }

  async updateDisplayOrders(displayOrders: Array<{ id: number; displayOrder: number }>): Promise<Banner[]> {
    const updatedBanners: Banner[] = [];
    
    for (const item of displayOrders) {
      await this.bannerRepository.update(item.id, { displayOrder: item.displayOrder });
      const updatedBanner = await this.findOne(item.id);
      updatedBanners.push(updatedBanner);
    }
    
    return updatedBanners;
  }

  async remove(id: number): Promise<{ message: string }> {
    // 배너 조회 (upload 관계 포함)
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['upload']
    });
    if (!banner) {
      throw new NotFoundException('배너를 찾을 수 없습니다.');
    }

    // 연결된 업로드 이미지 삭제 (S3에서 실제 삭제 + DB 소프트 삭제)
    if (banner.upload) {
      try {
        await this.s3Service.deleteFile(banner.upload.s3Key);
        console.log(`배너 이미지 삭제 완료: ${banner.upload.s3Key}`);
      } catch (error) {
        console.error(`S3 파일 삭제 실패: ${banner.upload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: banner.upload.id },
        { isDeleted: true }
      );
    }

    // Banner 엔티티에 직접 저장된 이미지 삭제 (백업용)
    if (banner.bannerImage) {
      try {
        const bannerImageKey = this.extractS3KeyFromUrl(banner.bannerImage);
        if (bannerImageKey) {
          await this.s3Service.deleteFile(bannerImageKey);
          console.log(`배너 이미지 삭제 완료: ${bannerImageKey}`);
        }
      } catch (error) {
        console.error(`배너 이미지 삭제 실패: ${banner.bannerImage}`, error);
      }
    }
    
    // 배너 삭제
    const result = await this.bannerRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('배너를 찾을 수 없습니다.');
    }
    
    return { message: '배너와 관련 이미지들이 성공적으로 삭제되었습니다.' };
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
} 