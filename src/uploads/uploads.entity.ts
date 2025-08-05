import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Banner } from '../banner/banner.entity';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'filename' })
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'board_id', nullable: true })
  boardId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => Banner, banner => banner.upload)
  @JoinColumn({ name: 'banner_id' })
  banner: Banner;
} 