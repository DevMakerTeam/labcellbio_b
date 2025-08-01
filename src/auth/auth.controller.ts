// src/auth/auth.controller.ts
import { Controller, Post, Req, UseGuards, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto, LogoutResponseDto, AuthStatusDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: '관리자 로그인', description: '관리자 계정으로 로그인합니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin', description: '관리자 아이디' },
        password: { type: 'string', example: 'password123', description: '관리자 비밀번호' }
      },
      required: ['username', 'password']
    }
  })
  @ApiResponse({ status: 201, description: '로그인 성공', schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: '로그인 성공' },
      user: { 
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'admin' },
          email: { type: 'string', example: 'admin@example.com' }
        }
      }
    }
  }})
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  login(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: '인증 실패: 사용자 정보가 없습니다.' });
    }

    req.login(req.user, (err) => {
      if (err) {
        return res.status(500).json({ message: '세션 저장 실패' });
      }
      return res.status(201).json({
        message: '로그인 성공',
        user: req.user,
      });
    });
  }

  @Get('logout')
  @ApiOperation({ summary: '로그아웃', description: '현재 세션을 종료하고 로그아웃합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공', schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: '로그아웃 완료' }
    }
  }})
  @ApiResponse({ status: 500, description: '로그아웃 중 오류 발생' })
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: '로그아웃 중 에러가 발생했습니다.' });
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 삭제
        res.json({ message: '로그아웃 완료' });
      });
    });
  }

  @Get('status')
  @ApiOperation({ summary: '인증 상태 확인', description: '현재 로그인 상태를 확인합니다.' })
  @ApiResponse({ status: 200, description: '인증 상태 반환', schema: {
    oneOf: [
      {
        type: 'object',
        properties: {
          loggedIn: { type: 'boolean', example: true },
          user: { 
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              username: { type: 'string', example: 'admin' },
              email: { type: 'string', example: 'admin@example.com' }
            }
          }
        }
      },
      {
        type: 'object',
        properties: {
          loggedIn: { type: 'boolean', example: false }
        }
      }
    ]
  }})
  status(@Req() req: Request) {
    if (req.isAuthenticated()) {
      // password 제외하고 user 객체 반환
      const { password, ...userWithoutPassword } = req.user as any;
      return { loggedIn: true, user: userWithoutPassword };
    } else {
      return { loggedIn: false };
    }
  }
}
