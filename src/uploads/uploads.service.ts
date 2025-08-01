import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './uploads.entity';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {}

  async createUpload(uploadData: {
    filename: string;
    originalName: string;
    fileUrl: string;
    s3Key: string;
    contentType: string;
    fileSize: number;
  }): Promise<Upload> {
    const upload = this.uploadRepository.create(uploadData);
    return await this.uploadRepository.save(upload);
  }

  async getUploadById(id: number): Promise<Upload | null> {
    return await this.uploadRepository.findOne({ where: { id, isDeleted: false } });
  }

  async getAllUploads(): Promise<Upload[]> {
    return await this.uploadRepository.find({ 
      where: { isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  async softDeleteUpload(id: number): Promise<void> {
    await this.uploadRepository.update(id, { isDeleted: true });
  }

  async getUploadsByType(contentType: string): Promise<Upload[]> {
    return await this.uploadRepository.find({
      where: { contentType, isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }
}
