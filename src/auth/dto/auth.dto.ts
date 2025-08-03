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
    example: '1234',
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
    description: 'JWT 액세스 토큰 (1시간 유효)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE2MzQ1Njg5NzAsImV4cCI6MTYzNDU3MjU3MH0.example'
  })
  accessToken: string;

  @ApiProperty({ 
    description: '사용자 정보',
    example: {
      id: 1,
      username: 'admin'
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
    description: '사용자 정보 (로그인된 경우에만, 로그아웃 시 null)',
    example: {
      id: 1,
      username: 'admin'
    },
    required: false,
    nullable: true
  })
  user?: {
    id: number;
    username: string;
    email: string;
  } | null;
} 