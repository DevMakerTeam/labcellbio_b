import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: '관리자 아이디', 
    example: 'admin',
    required: true 
  })
  username: string;

  @ApiProperty({ 
    description: '관리자 비밀번호', 
    example: 'password123',
    required: true 
  })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ 
    description: '응답 메시지', 
    example: '로그인 성공' 
  })
  message: string;

  @ApiProperty({ 
    description: '사용자 정보',
    example: {
      id: 1,
      username: 'admin',
      email: 'admin@example.com'
    }
  })
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export class LogoutResponseDto {
  @ApiProperty({ 
    description: '응답 메시지', 
    example: '로그아웃 완료' 
  })
  message: string;
}

export class AuthStatusDto {
  @ApiProperty({ 
    description: '로그인 상태', 
    example: true 
  })
  loggedIn: boolean;

  @ApiProperty({ 
    description: '사용자 정보 (로그인된 경우에만)',
    example: {
      id: 1,
      username: 'admin',
      email: 'admin@example.com'
    },
    required: false
  })
  user?: {
    id: number;
    username: string;
    email: string;
  };
} 