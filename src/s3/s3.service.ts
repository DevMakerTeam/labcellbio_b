// src/uploads/s3.service.ts

import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
      region: configService.get<string>('AWS_REGION') || 'us-east-1',
    });
    this.bucket = configService.get<string>('AWS_S3_BUCKET') || '';
  }

  async uploadImage(file: any): Promise<string> {
    // 파일 객체 검증
    if (!file) {
      throw new Error('파일이 제공되지 않았습니다.');
    }

    if (!file.originalname) {
      throw new Error('파일 이름이 없습니다.');
    }

    if (!file.buffer) {
      throw new Error('파일 데이터가 없습니다.');
    }

    const key = `images/${uuid()}-${file.originalname}`;

    this.logger.log(`📤 S3 업로드 시작 - Key: ${key}, Size: ${file.size} bytes`);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          // ACL: 'public-read', // ACL 제거
          ContentType: file.mimetype,
        })
      );

      const fileUrl = `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
      this.logger.log(`✅ S3 업로드 완료 - URL: ${fileUrl}`);
      
      return fileUrl;
    } catch (error) {
      this.logger.error(`❌ S3 업로드 실패: ${error.message}`);
      throw error;
    }
  }

  // S3에서 파일 삭제
  async deleteFile(s3Key: string): Promise<boolean> {
    try {
      this.logger.log(`🗑️ S3 파일 삭제 시작 - Key: ${s3Key}`);
      
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
        })
      );

      this.logger.log(`✅ S3 파일 삭제 완료 - Key: ${s3Key}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ S3 파일 삭제 실패: ${error.message}`);
      throw error;
    }
  }

  // Presigned URL 생성 (업로드용)
  async getPresignedUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> {
    try {
      this.logger.log(`🔄 Presigned URL 생성 요청 - Filename: ${filename}, ContentType: ${contentType}`);
      this.logger.log(`📦 사용할 버킷: ${this.bucket}`);
      
      const key = `images/${uuid()}-${filename}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        // ACL: 'public-read', // ACL 제거
      });

      this.logger.log(`🔑 S3 명령 생성 완료 - Key: ${key}`);
      
      // 업로드용: 환경 변수 또는 기본값 30분
      const uploadExpiresIn = this.configService.get<number>('S3_UPLOAD_EXPIRES_IN') || 1800;
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: uploadExpiresIn });
      
      // 영구 접근 URL (Presigned URL과 동일한 형식)
      const fileUrl = `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;

      this.logger.log(`✅ Presigned URL 생성 성공 - Key: ${key}, 만료: ${uploadExpiresIn}초`);
      this.logger.log(`📎 Upload URL: ${uploadUrl.substring(0, 100)}...`);
      this.logger.log(`🌐 영구 File URL: ${fileUrl}`);
      
      return { uploadUrl, fileUrl, s3Key: key };
    } catch (error) {
      this.logger.error(`❌ Presigned URL 생성 실패: ${error.message}`);
      this.logger.error(`🔍 오류 상세: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }


}
