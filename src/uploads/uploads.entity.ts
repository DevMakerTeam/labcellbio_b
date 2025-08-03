import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 