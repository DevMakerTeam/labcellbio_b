import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Upload } from '../uploads/uploads.entity';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'sub_title', length: 500, nullable: true })
  subTitle: string;

  @Column({ name: 'banner_image', length: 500, nullable: true })
  bannerImage: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 관계 설정 (1:1)
  @OneToOne(() => Upload, upload => upload.banner)
  @JoinColumn({ name: 'banner_id' })
  upload: Upload;
} 