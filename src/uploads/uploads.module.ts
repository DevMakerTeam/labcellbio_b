import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from '../s3/s3.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Upload } from './uploads.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Upload])
  ],
  providers: [S3Service, UploadsService],
  controllers: [UploadsController],
  exports: [S3Service, UploadsService],
})
export class UploadsModule {}
