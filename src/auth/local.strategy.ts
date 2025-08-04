import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Admin } from '../admin/admin.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Omit<Admin, 'password'>> {
    const user = await this.authService.validateUser(username, password);
    if (!user)
      throw new UnauthorizedException('아이디 또는 비밀번호가 잘못되었습니다.');
    return user;
  }
}
