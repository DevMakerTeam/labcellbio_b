import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './board.entity';
import { BoardResponseDto } from './dto/board-response.dto';
import { PaginationDto, PaginatedBoardResponseDto } from './dto/pagination.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('board')
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // 게시글 전체 조회 (페이지네이션 지원)
  @Get()
  @ApiOperation({
    summary: '게시글 전체 조회',
    description: '페이지네이션을 지원하는 게시글 목록을 조회합니다. 최신 게시글부터 정렬됩니다.'
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'pageSize',
    description: '페이지당 게시글 수',
    required: false,
    type: Number,
    example: 10
  })
  @ApiOkResponse({
    description: '게시글 목록 조회 성공',
    type: PaginatedBoardResponseDto
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedBoardResponseDto> {
    const { page, pageSize } = paginationDto;
    return this.boardService.findAll(page, pageSize);
  }

  // 게시글 단건 조회
  @Get(':id')
  @ApiOperation({
    summary: '게시글 단건 조회',
    description: '특정 ID의 게시글을 조회합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
    type: Number
  })
  @ApiOkResponse({
    description: '게시글 조회 성공',
    type: BoardResponseDto
  })
  @ApiNotFoundResponse({
    description: '게시글을 찾을 수 없음'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  findOne(@Param('id') id: number): Promise<BoardResponseDto> {
    return this.boardService.findOne(id);
  }

  // 게시글 생성
  @Post()
  @ApiOperation({
    summary: '게시글 생성',
    description: '새로운 게시글을 생성합니다.'
  })
  @ApiBody({
    type: CreateBoardDto,
    description: '게시글 생성 정보',
    examples: {
      example1: {
        summary: '기본 게시글 생성',
        value: {
            author: '작성자명',
            authorImage: 'https://example.com/author.jpg',
            title: '게시글 제목',
            description: '게시글 설명',
            content: '게시글 내용입니다.',
            thumbnail: 'https://example.com/thumbnail.jpg',
            boardImages: [1, 2, 3]
          }
      }
    }
  })
  @ApiCreatedResponse({
    description: '게시글 생성 성공',
    type: BoardResponseDto
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  create(@Body() createBoardDto: CreateBoardDto): Promise<BoardResponseDto> {
    return this.boardService.create(createBoardDto);
  }

  // 게시글 수정
  @Patch(':id')
  @ApiOperation({
    summary: '게시글 수정',
    description: '기존 게시글을 수정합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '수정할 게시글 ID',
    example: 1,
    type: Number
  })
  @ApiBody({
    type: UpdateBoardDto,
    description: '게시글 수정 정보',
    examples: {
      example1: {
        summary: '게시글 수정',
        value: {
          author: '수정된 작성자명',
          authorImage: 'https://example.com/new-author.jpg',
          title: '수정된 제목',
          description: '수정된 설명',
          content: '수정된 내용입니다.',
          thumbnail: 'https://example.com/new-thumbnail.jpg',
          boardImages: [1, 2, 3]
        }
      }
    }
  })
  @ApiOkResponse({
    description: '게시글 수정 성공',
    type: BoardResponseDto
  })
  @ApiNotFoundResponse({
    description: '게시글을 찾을 수 없음'
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  update(
    @Param('id') id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.update(id, updateBoardDto);
  }

  // 게시글 삭제
  @Delete(':id')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '특정 ID의 게시글을 삭제합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 게시글 ID',
    example: 1,
    type: Number
  })
  @ApiOkResponse({
    description: '게시글 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '게시글과 관련 이미지들이 성공적으로 삭제되었습니다.'
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: '게시글을 찾을 수 없음'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  remove(@Param('id') id: number): Promise<{ message: string }> {
    return this.boardService.remove(id);
  }
}
