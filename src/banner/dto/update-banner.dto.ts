import { IsOptional, IsNumber, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyThenString, IsNotEmptyThenStringMaxLength } from './custom-validators';

export class UpdateBannerDto {
  @ApiProperty({
    description: '배너 제목',
    example: '수정된 배너 제목',
    maxLength: 255
  })
  @IsNotEmptyThenStringMaxLength(255, { message: '제목은 필수입니다.' })
  title: string;

  @ApiProperty({
    description: '배너 부제목',
    example: '수정된 서브 타이틀',
    maxLength: 500
  })
  @IsNotEmptyThenStringMaxLength(500, { message: '부제목은 필수입니다.' })
  subTitle: string;

  @ApiProperty({
    description: '배너 데스크톱 이미지 URL',
    example: 'https://example.com/new-banner.jpg',
    maxLength: 500
  })
  @IsNotEmptyThenStringMaxLength(500, { message: '배너 데스크톱 이미지 URL은 필수입니다.' })
  bannerImage: string;

  @ApiProperty({
    description: '배너 모바일 이미지 URL',
    example: 'https://example.com/new-banner-mobile.jpg',
    maxLength: 500
  })
  @IsNotEmptyThenStringMaxLength(500, { message: '배너 모바일 이미지 URL은 필수입니다.' })
  bannerMobileImage: string;

  @ApiProperty({
    description: '배너 링크 URL',
    example: 'https://example.com',
    maxLength: 500
  })
  @IsUrl({}, { message: '유효한 URL을 입력해주세요.' })
  link: string;

  @ApiProperty({
    description: '새 창에서 링크 열기 여부',
    example: true
  })
  @IsBoolean({ message: '새 창 열기 여부는 true 또는 false여야 합니다.' })
  targetBlank: boolean;

  @ApiProperty({
    description: '노출 순서는 별도 배치 API를 통해 수정하세요',
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '노출 순서는 숫자여야 합니다.' })
  displayOrder?: number;
} 