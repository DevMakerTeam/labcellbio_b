import { IsString, IsOptional, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({
    description: '배너 제목',
    example: '메인 배너',
    maxLength: 255
  })
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MaxLength(255, { message: '제목은 255자를 초과할 수 없습니다.' })
  title: string;

  @ApiProperty({
    description: '배너 부제목',
    example: '서브 타이틀',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '부제목은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '부제목은 500자를 초과할 수 없습니다.' })
  subTitle?: string;

  @ApiProperty({
    description: '배너 이미지 URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '배너 이미지 URL은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '배너 이미지 URL은 500자를 초과할 수 없습니다.' })
  bannerImage?: string;

  @ApiProperty({
    description: '노출 순서 (생성 시 자동으로 마지막 순서로 설정됨)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '노출 순서는 숫자여야 합니다.' })
  displayOrder?: number;
} 