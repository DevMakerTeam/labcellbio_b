import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { Banner } from './banner.entity';
import { Upload } from '../uploads/uploads.entity';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, Upload])],
  controllers: [BannerController],
  providers: [BannerService, S3Service],
  exports: [BannerService],
})
export class BannerModule {} 