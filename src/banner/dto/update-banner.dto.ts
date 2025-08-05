import { PartialType } from '@nestjs/mapped-types';
import { CreateBannerDto } from './create-banner.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {
  @ApiProperty({
    description: '배너 제목 (수정 시 선택사항)',
    example: '수정된 배너 제목',
    maxLength: 255,
    required: false
  })
  title?: string;

  @ApiProperty({
    description: '배너 부제목 (수정 시 선택사항)',
    example: '수정된 서브 타이틀',
    required: false,
    maxLength: 500
  })
  subTitle?: string;

  @ApiProperty({
    description: '배너 이미지 URL (수정 시 선택사항)',
    example: 'https://example.com/new-banner.jpg',
    required: false,
    maxLength: 500
  })
  bannerImage?: string;

  @ApiProperty({
    description: '노출 순서는 별도 배치 API를 통해 수정하세요',
    example: 2,
    required: false
  })
  displayOrder?: number;
} 