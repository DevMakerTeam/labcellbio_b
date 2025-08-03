import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiProperty({ description: '파일명', example: 'image.jpg' })
  filename: string;

  @ApiProperty({ description: '파일 타입', example: 'image/jpeg', required: false })
  contentType?: string;
}

export class CompleteUploadDto {
  @ApiProperty({ description: '파일명', example: 'image.jpg' })
  filename: string;

  @ApiProperty({ description: '원본 파일명', example: 'image.jpg' })
  originalName: string;

  @ApiProperty({ description: '파일 URL', example: 'https://bucket.s3.region.amazonaws.com/images/uuid-image.jpg' })
  fileUrl: string;

  @ApiProperty({ description: 'S3 파일 키', example: 'images/uuid-image.jpg' })
  s3Key: string;

  @ApiProperty({ description: '파일 타입', example: 'image/jpeg' })
  contentType: string;

  @ApiProperty({ description: '파일 크기 (bytes)', example: 1024000 })
  fileSize: number;
}

// export class UploadResponseDto {
//   @ApiProperty({ description: '성공 여부', example: true })
//   success: boolean;

//   @ApiProperty({ description: '파일 URL', example: 'https://bucket.s3.region.amazonaws.com/images/uuid-image.jpg' })
//   fileUrl: string;

//   @ApiProperty({ description: '파일명', example: 'image.jpg' })
//   filename: string;

//   @ApiProperty({ description: '파일 크기', example: 1024000 })
//   size: number;

//   @ApiProperty({ description: '파일 타입', example: 'image/jpeg' })
//   mimetype: string;
// }

export class CompleteUploadResponseDto {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({ description: '업로드 ID', example: 1 })
  uploadId: number;

  @ApiProperty({ description: '업로드 정보' })
  upload: any;

  @ApiProperty({ description: '영구 URL', example: 'https://bucket.s3.region.amazonaws.com/images/uuid-image.jpg' })
  permanentUrl: string;

  @ApiProperty({ description: '메시지', example: '업로드가 완료되었습니다.' })
  message: string;
}

// export class EditorUploadResponseDto {
//   @ApiProperty({ description: '성공 여부', example: true })
//   success: boolean;

//   @ApiProperty({ description: '영구 URL', example: 'https://bucket.s3.region.amazonaws.com/images/uuid-image.jpg' })
//   url: string;

//   @ApiProperty({ description: '파일명', example: 'image.jpg' })
//   filename: string;

//   @ApiProperty({ description: '파일 크기', example: 1024000 })
//   size: number;

//   @ApiProperty({ description: '파일 타입', example: 'image/jpeg' })
//   mimetype: string;

//   @ApiProperty({ description: '업로드 ID', example: 1 })
//   uploadId: number;

//   @ApiProperty({ description: '메시지', example: '이미지가 성공적으로 업로드되었습니다.' })
//   message: string;
// } 