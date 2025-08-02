import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  findAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  findOne(id: number): Promise<Board> {
    return this.boardRepository.findOneByOrFail({ id });
  }

  create(dto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create(dto);
    return this.boardRepository.save(board);
  }

  async update(id: number, dto: UpdateBoardDto): Promise<Board> {
    await this.boardRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.boardRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    return { message: '게시글이 성공적으로 삭제되었습니다.' };
  }
}
