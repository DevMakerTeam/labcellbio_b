import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @ApiProperty({
    description: '텍스트 에디터에서 업로드된 이미지들의 upload ID 배열 (수정 시 선택사항)',
    example: [1, 2, 3],
    required: false,
    type: [Number]
  })
  boardImages?: any;
}
