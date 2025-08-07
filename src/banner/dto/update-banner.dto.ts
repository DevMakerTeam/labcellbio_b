import { IsOptional, IsNumber } from 'class-validator';
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
    description: '배너 이미지 URL',
    example: 'https://example.com/new-banner.jpg',
    maxLength: 500
  })
  @IsNotEmptyThenStringMaxLength(500, { message: '배너 이미지 URL은 필수입니다.' })
  bannerImage: string;

  @ApiProperty({
    description: '노출 순서는 별도 배치 API를 통해 수정하세요',
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '노출 순서는 숫자여야 합니다.' })
  displayOrder?: number;
} 