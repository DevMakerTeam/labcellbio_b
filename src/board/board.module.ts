import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Upload } from '../uploads/uploads.entity';
import { BoardImage } from './board-image.entity';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Upload, BoardImage])],
  controllers: [BoardController],
  providers: [BoardService, S3Service],
  exports: [BoardService], // 필요시 외부에서 BoardService 사용 가능하게
})
export class BoardModule {}
