import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BoardImage } from './board-image.entity';

@Entity('board')
export class Board {
  @ApiProperty({
    description: '게시글 고유 ID',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '작성자명',
    example: '홍길동',
    maxLength: 100
  })
  @Column({ name: 'writer_name', type: 'varchar', length: 100 })
  writerName: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요! 첫 번째 게시글입니다.',
    maxLength: 255
  })
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '이것은 게시글의 내용입니다. 긴 텍스트를 포함할 수 있습니다.'
  })
  @Column({ name: 'content', type: 'text' })
  content: string;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/thumbnail.jpg',
    required: false,
    maxLength: 500
  })
  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: '게시글에 포함된 이미지들',
    type: () => [BoardImage],
    required: false
  })
  @OneToMany(() => BoardImage, boardImage => boardImage.board)
  boardImages: BoardImage[];

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z'
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}
