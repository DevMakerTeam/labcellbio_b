// src/auth/auth.controller.ts
import { Controller, Post, Req, UseGuards, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto, AuthStatusDto, LogoutResponseDto } from './dto/auth.dto'; 
import { AuthService } from './auth.service';

@ApiTags('인증 (Authentication)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ 
    summary: '관리자 로그인', 
    description: '관리자 계정으로 로그인하여 JWT 토큰을 발급받습니다. 발급된 토큰은 1시간 동안 유효하며, 이후 API 요청 시 Authorization 헤더에 Bearer 토큰으로 포함해야 합니다.' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 201, 
    description: '로그인 성공', 
    type: LoginResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증 실패 - 잘못된 사용자명 또는 비밀번호',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '인증 실패: 사용자 정보가 없습니다.' }
      }
    }
  })
  @ApiResponse({ status: 500, description: '서버 오류' })
  login(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: '인증 실패: 사용자 정보가 없습니다.' });
    }

    // JWT 토큰 생성
    const accessToken = this.authService.generateToken(req.user);
    
    return res.status(201).json({
      message: '로그인 성공',
      accessToken,
      user: req.user,
    });
  }

  @Get('logout')
  @ApiOperation({ 
    summary: '로그아웃', 
    description: '로그아웃을 수행합니다. JWT는 클라이언트에서 토큰을 삭제하면 되므로 서버에서는 별도 처리가 필요하지 않습니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '로그아웃 성공', 
    type: LogoutResponseDto 
  })
  @ApiResponse({ status: 500, description: '로그아웃 중 오류 발생' })
  logout(@Req() req: Request, @Res() res: Response) {
    console.log('🚪 로그아웃 요청 - 클라이언트에서 토큰 삭제 필요');
    return res.json({ message: '로그아웃 완료' });
  }
  
  @Get('status')
  @ApiOperation({ 
    summary: '인증 상태 확인', 
    description: '현재 로그인 상태를 확인합니다. 토큰이 있으면 사용자 정보를, 없으면 로그인되지 않은 상태를 반환합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '인증 상태 반환', 
    schema: {
      type: 'object',
      properties: {
        loggedIn: { type: 'boolean' },
        user: { 
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  })
  async status(@Req() req: Request) {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { loggedIn: false, user: null };
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    const user = await this.authService.verifyToken(token);
    
    if (user) {
      return { loggedIn: true, user };
    } else {
      return { loggedIn: false, user: null };
    }
  }
}
