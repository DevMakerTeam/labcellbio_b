import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BoardResponseDto } from './board-response.dto';

export class PaginationDto {
  @ApiProperty({
    description: '페이지 번호 (1부터 시작)',
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: '페이지당 게시글 수',
    example: 10,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class PaginatedBoardResponseDto {
  @ApiProperty({
    description: '현재 페이지의 게시글 목록',
    type: 'array',
    items: { 
      type: 'object',
      properties: {
        id: { type: 'number' },
        author: { type: 'string' },
        authorImage: { type: 'string', nullable: true },
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        thumbnail: { type: 'string', nullable: true },
        boardImages: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              fileUrl: { type: 'string', nullable: true }
            }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  boards: BoardResponseDto[];

  @ApiProperty({
    description: '전체 게시글 수',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: '현재 페이지 번호',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: '페이지당 게시글 수',
    example: 10
  })
  pageSize: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 3
  })
  totalPages: number;

  @ApiProperty({
    description: '이전 페이지 존재 여부',
    example: false
  })
  hasPrevious: boolean;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true
  })
  hasNext: boolean;
} 