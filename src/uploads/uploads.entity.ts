import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Banner } from '../banner/banner.entity';

@Entity('uploads')
export class Upload {
  @ApiProperty({
    description: '업로드 파일 고유 ID',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '저장된 파일명',
    example: '250806123030_image.jpg'
  })
  @Column({ name: 'filename' })
  filename: string;

  @ApiProperty({
    description: '원본 파일명',
    example: 'image.jpg'
  })
  @Column({ name: 'original_name' })
  originalName: string;

  @ApiProperty({
    description: '파일 URL',
    example: 'https://example.com/images/image_123456.jpg'
  })
  @Column({ name: 'file_url' })
  fileUrl: string;

  @ApiProperty({
    description: 'S3 키',
    example: 'images/image_123456.jpg'
  })
  @Column({ name: 's3_key' })
  s3Key: string;

  @ApiProperty({
    description: '파일 타입',
    example: 'image/jpeg'
  })
  @Column({ name: 'content_type' })
  contentType: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000
  })
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @ApiProperty({
    description: '삭제 여부',
    example: false
  })
  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @ApiProperty({
    description: '연결된 게시글 ID',
    example: 1,
    required: false
  })
  @Column({ name: 'board_id', nullable: true })
  boardId?: number;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 관계 설정
  @OneToOne(() => Banner, banner => banner.desktopUpload)
  desktopBanner: Banner;

  @OneToOne(() => Banner, banner => banner.mobileUpload)
  mobileBanner: Banner;
} 