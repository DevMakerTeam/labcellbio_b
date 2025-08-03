import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Board } from './board.entity';
import { Upload } from '../uploads/uploads.entity';

@Entity('board_images')
export class BoardImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'board_id' })
  boardId: number;

  @Column({ name: 'upload_id' })
  uploadId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 관계 설정
  @ManyToOne(() => Board, board => board.boardImages)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => Upload)
  @JoinColumn({ name: 'upload_id' })
  upload: Upload;
} 