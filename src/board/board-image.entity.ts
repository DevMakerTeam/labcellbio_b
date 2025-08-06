import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Board } from './board.entity';
import { Upload } from '../uploads/uploads.entity';

@Entity('board_images')
export class BoardImage {
  @ApiProperty({
    description: '게시글 이미지 고유 ID',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '게시글 ID',
    example: 1
  })
  @Column()
  boardId: number;

  @ApiProperty({
    description: '업로드 ID',
    example: 1
  })
  @Column()
  uploadId: number;

  @ManyToOne(() => Board, board => board.boardImages)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @ManyToOne(() => Upload)
  @JoinColumn({ name: 'uploadId' })
  upload: Upload;
} 