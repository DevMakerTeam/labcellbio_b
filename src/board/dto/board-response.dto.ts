import { ApiProperty } from '@nestjs/swagger';

export class BoardImageResponseDto {
  @ApiProperty({
    description: '업로드 ID (Upload 테이블의 ID)',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '파일 URL',
    example: 'https://example.com/images/image.jpg'
  })
  fileUrl: string | null;
}

export class BoardResponseDto {
  @ApiProperty({
    description: '게시글 고유 ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '작성자명',
    example: '홍길동'
  })
  author: string;

  @ApiProperty({
    description: '작성자 이미지 URL',
    example: 'https://example.com/author.jpg',
    required: false
  })
  authorImage?: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요! 첫 번째 게시글입니다.'
  })
  title: string;

  @ApiProperty({
    description: '게시글 설명',
    example: '이 게시글에 대한 간단한 설명입니다.',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '이것은 게시글의 내용입니다.'
  })
  content: string;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/thumbnail.jpg',
    required: false
  })
  thumbnail?: string;

  @ApiProperty({
    description: '게시글에 포함된 이미지들',
    type: () => [BoardImageResponseDto]
  })
  boardImages: BoardImageResponseDto[];

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
} 