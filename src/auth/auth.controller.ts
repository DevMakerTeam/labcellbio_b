// src/auth/auth.controller.ts
import { Controller, Post, Req, UseGuards, Get, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(AuthGuard('local'))
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
