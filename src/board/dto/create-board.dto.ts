import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    description: '작성자명',
    example: '홍길동',
    maxLength: 100
  })
  @IsNotEmpty({ message: '작성자명은 필수입니다.' })
  @IsString({ message: '작성자명은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '작성자명은 100자를 초과할 수 없습니다.' })
  author: string;

  @ApiProperty({
    description: '작성자 이미지 URL',
    example: 'https://example.com/author.jpg',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '작성자 이미지 URL은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '작성자 이미지 URL은 500자를 초과할 수 없습니다.' })
  authorImage?: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요! 첫 번째 게시글입니다.',
    maxLength: 255
  })
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MaxLength(255, { message: '제목은 255자를 초과할 수 없습니다.' })
  title: string;

  @ApiProperty({
    description: '게시글 설명',
    example: '이 게시글에 대한 간단한 설명입니다.',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '설명은 500자를 초과할 수 없습니다.' })
  description?: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '이것은 게시글의 내용입니다. 긴 텍스트를 포함할 수 있습니다.'
  })
  @IsNotEmpty({ message: '내용은 필수입니다.' })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  content: string;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/thumbnail.jpg',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '썸네일 URL은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '썸네일 URL은 500자를 초과할 수 없습니다.' })
  thumbnail?: string;

  @ApiProperty({
    description: '텍스트 에디터에서 업로드된 이미지들의 upload ID 배열',
    example: [1, 2, 3],
    required: false,
    type: [Number]
  })
  @IsOptional()
  boardImages?: any;
}
