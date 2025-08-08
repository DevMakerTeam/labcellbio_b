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
  @Column({ name: 'title', length: 255 })
  title: string;

  @ApiProperty({
    description: '배너 부제목',
    example: '서브 타이틀',
    maxLength: 500
  })
  @Column({ name: 'sub_title', length: 500 })
  subTitle: string;

  @ApiProperty({
    description: '배너 이미지 URL',
    example: 'https://example.com/banner.jpg',
    maxLength: 500
  })
  @Column({ name: 'banner_image', length: 500 })
  bannerImage: string;

  @ApiProperty({
    description: '배너 링크 URL',
    example: 'https://example.com',
    maxLength: 500
  })
  @Column({ name: 'link', length: 500 })
  link: string;

  @ApiProperty({
    description: '새 창에서 링크 열기 여부',
    example: true,
    default: false
  })
  @Column({ name: 'target_blank', default: false })
  targetBlank: boolean;

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

  @ApiProperty({
    description: '연결된 업로드 정보',
    type: () => Upload,
    required: false
  })
  // 관계 설정 (1:1)
  @OneToOne(() => Upload, upload => upload.banner)
  @JoinColumn({ name: 'upload_id' })
  upload: Upload;
} 