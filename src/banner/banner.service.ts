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
      relations: ['desktopUpload', 'mobileUpload']
    });
  }

  findOne(id: number): Promise<Banner> {
    return this.bannerRepository.findOneOrFail({
      where: { id },
      relations: ['desktopUpload', 'mobileUpload']
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

    // bannerImage URL로 desktop uploadId 찾기
    let desktopUploadId: number | null = null;
    if (dto.bannerImage) {
      console.log('bannerImage URL로 desktop upload 찾는 중:', dto.bannerImage);
      const uploads = await this.uploadRepository.find({
        where: { fileUrl: dto.bannerImage, isDeleted: false },
        take: 1
      });
      console.log('찾은 desktop uploads:', uploads);
      if (uploads.length > 0) {
        desktopUploadId = uploads[0].id;
        console.log('찾은 desktop uploadId:', desktopUploadId);
      } else {
        console.log('해당 fileUrl을 가진 desktop upload를 찾을 수 없음');
      }
    }

    // bannerMobileImage URL로 mobile uploadId 찾기
    let mobileUploadId: number | null = null;
    if (dto.bannerMobileImage) {
      console.log('bannerMobileImage URL로 mobile upload 찾는 중:', dto.bannerMobileImage);
      const uploads = await this.uploadRepository.find({
        where: { fileUrl: dto.bannerMobileImage, isDeleted: false },
        take: 1
      });
      console.log('찾은 mobile uploads:', uploads);
      if (uploads.length > 0) {
        mobileUploadId = uploads[0].id;
        console.log('찾은 mobile uploadId:', mobileUploadId);
      } else {
        console.log('해당 fileUrl을 가진 mobile upload를 찾을 수 없음');
      }
    }

    // 배너 생성
    console.log('배너 생성 데이터:', {
      title: dto.title,
      subTitle: dto.subTitle,
      bannerImage: dto.bannerImage,
      bannerMobileImage: dto.bannerMobileImage,
      link: dto.link,
      targetBlank: dto.targetBlank,
      displayOrder: dto.displayOrder
    });
    
    const banner = this.bannerRepository.create({
      title: dto.title,
      subTitle: dto.subTitle,
      bannerImage: dto.bannerImage,
      bannerMobileImage: dto.bannerMobileImage,
      link: dto.link,
      targetBlank: dto.targetBlank,
      displayOrder: dto.displayOrder
    });
    
    console.log('생성된 banner 객체:', banner);
    const savedBanner = await this.bannerRepository.save(banner);
    console.log('저장된 banner:', savedBanner);
    
    // desktop upload 관계 설정 (desktopUploadId가 있는 경우)
    if (desktopUploadId) {
      await this.bannerRepository
        .createQueryBuilder()
        .update(Banner)
        .set({ desktopUpload: { id: desktopUploadId } })
        .where("id = :id", { id: savedBanner.id })
        .execute();
      console.log(`배너와 데스크톱 업로드 연결 완료: bannerId ${savedBanner.id} -> desktopUploadId ${desktopUploadId}`);
    }

    // mobile upload 관계 설정 (mobileUploadId가 있는 경우)
    if (mobileUploadId) {
      await this.bannerRepository
        .createQueryBuilder()
        .update(Banner)
        .set({ mobileUpload: { id: mobileUploadId } })
        .where("id = :id", { id: savedBanner.id })
        .execute();
      console.log(`배너와 모바일 업로드 연결 완료: bannerId ${savedBanner.id} -> mobileUploadId ${mobileUploadId}`);
    }
    
    // 관계 정보를 포함하여 반환
    return this.findOne(savedBanner.id);
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    // 기존 배너 조회 (upload 관계 포함)
    const existingBanner = await this.findOne(id);
    
    // 기존 데스크톱 이미지가 있고, 새로운 이미지로 변경되는 경우 기존 이미지 삭제
    if (existingBanner.desktopUpload && dto.bannerImage && existingBanner.bannerImage !== dto.bannerImage) {
      try {
        await this.s3Service.deleteFile(existingBanner.desktopUpload.s3Key);
        console.log(`기존 배너 데스크톱 이미지 삭제 완료: ${existingBanner.desktopUpload.s3Key}`);
      } catch (error) {
        console.error(`기존 배너 데스크톱 이미지 S3 삭제 실패: ${existingBanner.desktopUpload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: existingBanner.desktopUpload.id },
        { isDeleted: true }
      );
      console.log(`기존 배너 데스크톱 이미지 DB 소프트 삭제 완료: uploadId ${existingBanner.desktopUpload.id}`);
    }

    // 기존 모바일 이미지가 있고, 새로운 이미지로 변경되는 경우 기존 이미지 삭제
    if (existingBanner.mobileUpload && dto.bannerMobileImage && existingBanner.bannerMobileImage !== dto.bannerMobileImage) {
      try {
        await this.s3Service.deleteFile(existingBanner.mobileUpload.s3Key);
        console.log(`기존 배너 모바일 이미지 삭제 완료: ${existingBanner.mobileUpload.s3Key}`);
      } catch (error) {
        console.error(`기존 배너 모바일 이미지 S3 삭제 실패: ${existingBanner.mobileUpload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: existingBanner.mobileUpload.id },
        { isDeleted: true }
      );
      console.log(`기존 배너 모바일 이미지 DB 소프트 삭제 완료: uploadId ${existingBanner.mobileUpload.id}`);
    }

    await this.bannerRepository.update(id, dto);
    const updatedBanner = await this.findOne(id);
    
    // bannerImage URL로 desktop uploadId 찾아서 연결
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
          .set({ desktopUpload: { id: upload.id } })
          .where("id = :id", { id: updatedBanner.id })
          .execute();
        console.log(`배너와 데스크톱 업로드 연결 완료: bannerId ${updatedBanner.id} -> uploadId ${upload.id}`);
      }
    }

    // bannerMobileImage URL로 mobile uploadId 찾아서 연결
    if (dto.bannerMobileImage) {
      const uploads = await this.uploadRepository.find({
        where: { fileUrl: dto.bannerMobileImage, isDeleted: false },
        take: 1
      });
      if (uploads.length > 0) {
        const upload = uploads[0];
        // 관계 설정을 위해 QueryBuilder 사용
        await this.bannerRepository
          .createQueryBuilder()
          .update(Banner)
          .set({ mobileUpload: { id: upload.id } })
          .where("id = :id", { id: updatedBanner.id })
          .execute();
        console.log(`배너와 모바일 업로드 연결 완료: bannerId ${updatedBanner.id} -> uploadId ${upload.id}`);
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
      relations: ['desktopUpload', 'mobileUpload']
    });
    if (!banner) {
      throw new NotFoundException('배너를 찾을 수 없습니다.');
    }

    // 연결된 데스크톱 업로드 이미지 삭제 (S3에서 실제 삭제 + DB 소프트 삭제)
    if (banner.desktopUpload) {
      try {
        await this.s3Service.deleteFile(banner.desktopUpload.s3Key);
        console.log(`배너 데스크톱 이미지 삭제 완료: ${banner.desktopUpload.s3Key}`);
      } catch (error) {
        console.error(`S3 데스크톱 파일 삭제 실패: ${banner.desktopUpload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: banner.desktopUpload.id },
        { isDeleted: true }
      );
    }

    // 연결된 모바일 업로드 이미지 삭제 (S3에서 실제 삭제 + DB 소프트 삭제)
    if (banner.mobileUpload) {
      try {
        await this.s3Service.deleteFile(banner.mobileUpload.s3Key);
        console.log(`배너 모바일 이미지 삭제 완료: ${banner.mobileUpload.s3Key}`);
      } catch (error) {
        console.error(`S3 모바일 파일 삭제 실패: ${banner.mobileUpload.s3Key}`, error);
      }
      
      // DB에서 소프트 삭제
      await this.uploadRepository.update(
        { id: banner.mobileUpload.id },
        { isDeleted: true }
      );
    }

    // Banner 엔티티에 직접 저장된 이미지 삭제 (백업용)
    if (banner.bannerImage) {
      try {
        const bannerImageKey = this.extractS3KeyFromUrl(banner.bannerImage);
        if (bannerImageKey) {
          await this.s3Service.deleteFile(bannerImageKey);
          console.log(`배너 데스크톱 이미지 삭제 완료: ${bannerImageKey}`);
        }
      } catch (error) {
        console.error(`배너 데스크톱 이미지 삭제 실패: ${banner.bannerImage}`, error);
      }
    }

    if (banner.bannerMobileImage) {
      try {
        const bannerMobileImageKey = this.extractS3KeyFromUrl(banner.bannerMobileImage);
        if (bannerMobileImageKey) {
          await this.s3Service.deleteFile(bannerMobileImageKey);
          console.log(`배너 모바일 이미지 삭제 완료: ${bannerMobileImageKey}`);
        }
      } catch (error) {
        console.error(`배너 모바일 이미지 삭제 실패: ${banner.bannerMobileImage}`, error);
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