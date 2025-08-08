import { IsOptional, IsNumber, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyThenString, IsNotEmptyThenStringMaxLength } from './custom-validators';

export class CreateBannerDto {
  @ApiProperty({
    description: '배너 제목',
    example: '메인 배너',
    maxLength: 255
  })
  @IsNotEmptyThenStringMaxLength(255, { message: '제목은 필수입니다.' })
  title: string;

  @ApiProperty({
    description: '배너 부제목',
    example: '서브 타이틀',
    maxLength: 500
  })
  @IsNotEmptyThenStringMaxLength(500, { message: '부제목은 필수입니다.' })
  subTitle: string;

  @ApiProperty({
    description: '배너 데스크톱 이미지 URL',
    example: 'https://example.com/banner.jpg',
    maxLength: 500
  })
  @IsNotEmptyThenStringMaxLength(500, { message: '배너 데스크톱 이미지 URL은 필수입니다.' })
  bannerImage: string;

  @ApiProperty({
    description: '배너 모바일 이미지 URL',
    example: 'https://example.com/banner-mobile.jpg',
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
    example: true,
    default: false
  })
  @IsBoolean({ message: '새 창 열기 여부는 true 또는 false여야 합니다.' })
  targetBlank: boolean;

  @ApiProperty({
    description: '노출 순서 (생성 시 자동으로 마지막 순서로 설정됨)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '노출 순서는 숫자여야 합니다.' })
  displayOrder?: number;
} 