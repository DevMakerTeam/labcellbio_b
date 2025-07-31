// src/auth/session.serializer.ts
import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, user.id); // 세션에 id만 저장
  }

  async deserializeUser(id: number, done: Function) {
    const user = await this.authService.findUserById(id);
    done(null, user); // 요청에 user 객체 attach
  }
}
