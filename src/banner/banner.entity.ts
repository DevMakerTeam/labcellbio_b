import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Upload } from '../uploads/uploads.entity';

@Entity('banners')
export class Banner {
  @ApiProperty({
    description: '배너 고유 ID',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '배너 제목',
    example: '메인 배너',
    maxLength: 255
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    description: '배너 부제목',
    example: '서브 타이틀',
    required: false,
    maxLength: 500
  })
  @Column({ name: 'sub_title', length: 500, nullable: true })
  subTitle: string;

  @ApiProperty({
    description: '배너 이미지 URL',
    example: 'https://example.com/banner.jpg',
    required: false,
    maxLength: 500
  })
  @Column({ name: 'banner_image', length: 500, nullable: true })
  bannerImage: string;

  @ApiProperty({
    description: '노출 순서 (낮은 숫자가 먼저 노출)',
    example: 1
  })
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

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

  // 관계 설정 (1:1)
  @OneToOne(() => Upload, upload => upload.banner)
  @JoinColumn({ name: 'banner_id' })
  upload: Upload;
} 