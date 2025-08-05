import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Banner } from '../banner/banner.entity';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  fileUrl: string;

  @Column()
  s3Key: string;

  @Column()
  contentType: string;

  @Column('bigint')
  fileSize: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  boardId?: number;

  @Column({ nullable: true })
  bannerId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => Banner, banner => banner.upload)
  @JoinColumn({ name: 'banner_id' })
  banner: Banner;
} 