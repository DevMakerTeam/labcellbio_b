import { Controller, Get, Post, Query, Body, UseInterceptors, UploadedFile, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';
import { UploadsService } from './uploads.service';
import { CompleteUploadDto, UploadResponseDto, EditorUploadResponseDto, PresignedUrlDto } from './dto/upload.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly uploadsService: UploadsService,
  ) {}

  // 환경 변수 테스트
  @Get('test-config')
  @ApiOperation({ summary: '환경 변수 상태 확인', description: 'AWS 환경 변수 설정 상태를 확인합니다.' })
  @ApiResponse({ status: 200, description: '환경 변수 상태 반환' })
  async testConfig() {
    const config = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? '설정됨 (' + process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...)' : '설정되지 않음',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? '설정됨 (' + process.env.AWS_SECRET_ACCESS_KEY.substring(0, 8) + '...)' : '설정되지 않음',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || '설정되지 않음',
    };
    return { 
      message: '환경 변수 상태',
      config,
      timestamp: new Date().toISOString()
    };
  }

  // Presigned URL 생성 (텍스트 에디터용)
  @Get('presigned-url')
  @ApiOperation({ summary: 'Presigned URL 생성', description: 'S3 업로드용 Presigned URL을 생성합니다.' })
  @ApiQuery({ name: 'filename', description: '파일명', example: 'image.jpg' })
  @ApiQuery({ name: 'contentType', description: '파일 타입', example: 'image/jpeg', required: false })
  @ApiResponse({ status: 200, description: 'Presigned URL 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getPresignedUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string = 'image/jpeg'
  ) {
    return this.s3Service.getPresignedUrl(filename, contentType);
  }

  // Presigned URL로 업로드 완료 후 DB에 저장
  @Post('complete-upload')
  @ApiOperation({ summary: '업로드 완료 처리', description: 'Presigned URL로 업로드 완료 후 DB에 저장합니다.' })
  @ApiBody({ type: CompleteUploadDto })
  @ApiResponse({ status: 201, description: '업로드 완료', type: UploadResponseDto })
  async completeUpload(@Body() uploadData: CompleteUploadDto) {
    // 영구 URL로 변환 (S3Key 기반)
    const region = process.env.AWS_REGION || 'ap-northeast-2';
    const bucket = process.env.AWS_S3_BUCKET || 'labcellbio-images';
    const permanentUrl = `https://${bucket}.s3.${region}.amazonaws.com/${uploadData.s3Key}`;
    
    // 영구 URL로 업데이트
    const uploadDataWithPermanentUrl = {
      ...uploadData,
      fileUrl: permanentUrl
    };
    
    const upload = await this.uploadsService.createUpload(uploadDataWithPermanentUrl);
    return { 
      success: true, 
      upload,
      permanentUrl,
      message: '업로드가 완료되었습니다.'
    };
  }

  // 직접 파일 업로드 (기존 방식)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '파일 직접 업로드', description: '백엔드를 통해 S3에 파일을 직접 업로드합니다.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 파일'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: '업로드 성공', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: '파일이 없거나 잘못된 요청' })
  async uploadFile(@UploadedFile() file: any) {
    // 파일 검증
    if (!file) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }

    console.log('📁 업로드된 파일 정보:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? '있음' : '없음'
    });

    const fileUrl = await this.s3Service.uploadImage(file);
    
    // DB에 업로드 정보 저장
    const upload = await this.uploadsService.createUpload({
      filename: file.filename || `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      fileUrl,
      s3Key: `images/${file.filename || `${Date.now()}-${file.originalname}`}`,
      contentType: file.mimetype,
      fileSize: file.size,
    });

    return { 
      success: true, 
      fileUrl,
      upload,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  // 텍스트 에디터용 이미지 업로드 (영구 저장)
  @Post('editor-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '텍스트 에디터용 이미지 업로드', description: '텍스트 에디터에서 사용할 이미지를 영구 저장합니다.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일 (JPEG, PNG, GIF, WebP)'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: '업로드 성공', type: EditorUploadResponseDto })
  @ApiResponse({ status: 400, description: '지원하지 않는 파일 형식' })
  async uploadForEditor(@UploadedFile() file: any) {
    // 파일 검증
    if (!file) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }

    // 이미지 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 지원)');
    }

    console.log('📝 텍스트 에디터 이미지 업로드:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? '있음' : '없음'
    });

    // S3에 영구 업로드
    const fileUrl = await this.s3Service.uploadImage(file);
    
    // DB에 업로드 정보 저장
    const upload = await this.uploadsService.createUpload({
      filename: file.filename || `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      fileUrl,
      s3Key: `images/${file.filename || `${Date.now()}-${file.originalname}`}`,
      contentType: file.mimetype,
      fileSize: file.size,
    });

    // 텍스트 에디터용 응답 형식
    return { 
      success: true, 
      url: fileUrl, // 영구 URL
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadId: upload.id,
      message: '이미지가 성공적으로 업로드되었습니다.'
    };
  }

  // 업로드된 파일 목록 조회
  @Get()
  @ApiOperation({ summary: '업로드된 파일 목록 조회', description: '모든 업로드된 파일 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '파일 목록 반환' })
  async getAllUploads() {
    return await this.uploadsService.getAllUploads();
  }

  // 특정 파일 조회
  @Get(':id')
  @ApiOperation({ summary: '특정 파일 조회', description: 'ID로 특정 파일 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '파일 ID', example: 1 })
  @ApiResponse({ status: 200, description: '파일 정보 반환' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  async getUploadById(@Param('id') id: number) {
    return await this.uploadsService.getUploadById(id);
  }

  // 파일 삭제 (소프트 삭제)
  @Delete(':id')
  @ApiOperation({ summary: '파일 삭제', description: '파일을 소프트 삭제합니다.' })
  @ApiParam({ name: 'id', description: '파일 ID', example: 1 })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  async deleteUpload(@Param('id') id: number) {
    await this.uploadsService.softDeleteUpload(id);
    return { success: true, message: '파일이 삭제되었습니다.' };
  }

  // 다운로드용 Presigned URL 생성
  @Get('download-url')
  @ApiOperation({ summary: '다운로드용 Presigned URL 생성', description: '파일 다운로드용 Presigned URL을 생성합니다.' })
  @ApiQuery({ name: 'key', description: 'S3 파일 키', example: 'images/uuid-image.jpg' })
  @ApiResponse({ status: 200, description: '다운로드 URL 생성 성공' })
  async getDownloadUrl(@Query('key') key: string) {
    const downloadUrl = await this.s3Service.getPresignedDownloadUrl(key);
    return { downloadUrl };
  }
}
