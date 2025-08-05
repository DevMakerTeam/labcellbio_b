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
      }
    });
  }

  findOne(id: number): Promise<Banner> {
    return this.bannerRepository.findOneByOrFail({ id });
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    // displayOrder가 지정되지 않았으면 마지막 순서로 설정
    if (dto.displayOrder === undefined) {
      const lastBanner = await this.bannerRepository.findOne({
        order: { displayOrder: 'DESC' }
      });
      dto.displayOrder = lastBanner ? lastBanner.displayOrder + 1 : 1;
    }

    const banner = this.bannerRepository.create(dto);
    const savedBanner = await this.bannerRepository.save(banner);
    
    // bannerImage의 bannerId 업데이트
    await this.updateImageBannerId(savedBanner);
    
    return savedBanner;
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    await this.bannerRepository.update(id, dto);
    const updatedBanner = await this.findOne(id);
    
    // bannerImage의 bannerId 업데이트
    await this.updateImageBannerId(updatedBanner);
    
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
    // 배너 조회 (이미지 URL 확인을 위해)
    const banner = await this.bannerRepository.findOneBy({ id });
    if (!banner) {
      throw new NotFoundException('배너를 찾을 수 없습니다.');
    }

    // bannerId로 연결된 업로드 조회 (1:1 관계)
    const bannerUpload = await this.uploadRepository.findOne({
      where: { bannerId: id, isDeleted: false }
    });
    
    // 연결된 이미지 삭제 (S3에서 실제 삭제 + DB 소프트 삭제)
    if (bannerUpload) {
      try {
        await this.s3Service.deleteFile(bannerUpload.s3Key);
        console.log(`배너 이미지 삭제 완료: ${bannerUpload.s3Key}`);
      } catch (error) {
        console.error(`S3 파일 삭제 실패: ${bannerUpload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: bannerUpload.id },
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
   * bannerImage의 bannerId를 업데이트하는 메서드
   */
  private async updateImageBannerId(banner: Banner): Promise<void> {
    if (banner.bannerImage) {
      const bannerImageKey = this.extractS3KeyFromUrl(banner.bannerImage);
      if (bannerImageKey) {
        try {
          await this.uploadRepository.update(
            { s3Key: bannerImageKey },
            { bannerId: banner.id }
          );
          console.log(`배너 이미지 bannerId 업데이트 완료: ${bannerImageKey} -> bannerId: ${banner.id}`);
        } catch (error) {
          console.error(`배너 이미지 bannerId 업데이트 실패: ${bannerImageKey}`, error);
        }
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
} 