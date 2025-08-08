import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from './banner.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  // 배너 전체 조회
  @Get()
  @ApiOperation({
    summary: '배너 전체 조회',
    description: '모든 배너 목록을 노출 순서대로 조회합니다.'
  })
  @ApiOkResponse({
    description: '배너 목록 조회 성공',
    type: [Banner]
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  findAll(): Promise<Banner[]> {
    return this.bannerService.findAll();
  }

  // 배너 단건 조회
  @Get(':id')
  @ApiOperation({
    summary: '배너 단건 조회',
    description: '특정 ID의 배너를 조회합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '배너 ID',
    example: 1,
    type: Number
  })
  @ApiOkResponse({
    description: '배너 조회 성공',
    type: Banner
  })
  @ApiNotFoundResponse({
    description: '배너를 찾을 수 없음'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  findOne(@Param('id') id: number): Promise<Banner> {
    return this.bannerService.findOne(id);
  }

  // 배너 생성
  @Post()
  @ApiOperation({
    summary: '배너 생성',
    description: '새로운 배너를 생성합니다.'
  })
  @ApiBody({
    type: CreateBannerDto,
    description: '배너 생성 정보',
    examples: {
      example1: {
        summary: '기본 배너 생성',
        value: {
          title: '메인 배너',
          subTitle: '서브 타이틀',
          bannerImage: 'https://example.com/banner.jpg',
          bannerMobileImage: 'https://example.com/banner-mobile.jpg',
          link: 'https://example.com',
          targetBlank: false
        }
      },
      example2: {
        summary: 'displayOrder 지정 배너 생성',
        value: {
          title: '우선 배너',
          subTitle: '가장 먼저 보여질 배너',
          bannerImage: 'https://example.com/priority-banner.jpg',
          bannerMobileImage: 'https://example.com/priority-banner-mobile.jpg',
          link: 'https://example.com/priority',
          targetBlank: true,
          displayOrder: 1
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: '배너 생성 성공',
    type: Banner
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  create(@Body() createBannerDto: CreateBannerDto): Promise<Banner> {
    return this.bannerService.create(createBannerDto);
  }

  // 배너 수정
  @Patch(':id')
  @ApiOperation({
    summary: '배너 수정',
    description: '기존 배너를 수정합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '수정할 배너 ID',
    example: 1,
    type: Number
  })
  @ApiBody({
    type: UpdateBannerDto,
    description: '배너 수정 정보 (노출 순서는 별도 배치 API 사용)',
    examples: {
      example1: {
        summary: '배너 내용 전체 수정',
        value: {
          title: '수정된 배너 제목',
          subTitle: '수정된 서브 타이틀',
          bannerImage: 'https://example.com/new-banner.jpg',
          bannerMobileImage: 'https://example.com/new-banner-mobile.jpg',
          link: 'https://example.com/updated',
          targetBlank: true
        }
      },
      example2: {
        summary: '배너 링크 설정 변경',
        value: {
          title: '기존 배너 제목',
          subTitle: '기존 서브 타이틀',
          bannerImage: 'https://example.com/existing-banner.jpg',
          bannerMobileImage: 'https://example.com/existing-banner-mobile.jpg',
          link: 'https://example.com/new-link',
          targetBlank: false
        }
      }
    }
  })
  @ApiOkResponse({
    description: '배너 수정 성공',
    type: Banner
  })
  @ApiNotFoundResponse({
    description: '배너를 찾을 수 없음'
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
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    return this.bannerService.update(id, updateBannerDto);
  }

  // 배너 노출 순서 일괄 수정
  @Patch('display-orders/batch')
  @ApiOperation({
    summary: '배너 노출 순서 일괄 수정',
    description: '드래그 앤 드롭으로 변경된 배너들의 노출 순서를 일괄 수정합니다. (개별 배너 수정 시에는 사용하지 마세요)'
  })
  @ApiBody({
    description: '배너 노출 순서 배열',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: '배너 ID'
          },
          displayOrder: {
            type: 'number',
            description: '노출 순서'
          }
        }
      },
      example: [
        { id: 1, displayOrder: 1 },
        { id: 2, displayOrder: 2 },
        { id: 3, displayOrder: 3 }
      ]
    }
  })
  @ApiOkResponse({
    description: '노출 순서 수정 성공',
    type: [Banner]
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  updateDisplayOrders(
    @Body() displayOrders: Array<{ id: number; displayOrder: number }>
  ): Promise<Banner[]> {
    return this.bannerService.updateDisplayOrders(displayOrders);
  }

  // 배너 삭제
  @Delete(':id')
  @ApiOperation({
    summary: '배너 삭제',
    description: '특정 ID의 배너를 삭제합니다.'
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 배너 ID',
    example: 1,
    type: Number
  })
  @ApiOkResponse({
    description: '배너 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '배너와 관련 이미지들이 성공적으로 삭제되었습니다.'
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: '배너를 찾을 수 없음'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류'
  })
  remove(@Param('id') id: number): Promise<{ message: string }> {
    return this.bannerService.remove(id);
  }
} 