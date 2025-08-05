import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @ApiProperty({
    description: '작성자명 (수정 시 선택사항)',
    example: '홍길동',
    maxLength: 100,
    required: false
  })
  author?: string;

  @ApiProperty({
    description: '작성자 이미지 URL (수정 시 선택사항)',
    example: 'https://example.com/author.jpg',
    required: false,
    maxLength: 500
  })
  authorImage?: string;

  @ApiProperty({
    description: '게시글 제목 (수정 시 선택사항)',
    example: '수정된 제목입니다.',
    maxLength: 255,
    required: false
  })
  title?: string;

  @ApiProperty({
    description: '게시글 설명 (수정 시 선택사항)',
    example: '수정된 설명입니다.',
    required: false,
    maxLength: 500
  })
  description?: string;

  @ApiProperty({
    description: '게시글 내용 (수정 시 선택사항)',
    example: '수정된 내용입니다.',
    required: false
  })
  content?: string;

  @ApiProperty({
    description: '썸네일 이미지 URL (수정 시 선택사항)',
    example: 'https://example.com/new-thumbnail.jpg',
    required: false,
    maxLength: 500
  })
  thumbnail?: string;

  @ApiProperty({
    description: '텍스트 에디터에서 업로드된 이미지들의 upload ID 배열 (수정 시 선택사항)',
    example: [1, 2, 3],
    required: false,
    type: [Number]
  })
  boardImages?: any;
}
