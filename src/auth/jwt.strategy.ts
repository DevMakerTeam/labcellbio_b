// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    const secret = process.env.JWT_SECRET ?? 'your-secret-key';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT 전략 - 페이로드:', payload);
    const user = await this.authService.findUserById(payload.sub as number);
    if (!user) {
      console.log('❌ JWT 전략 - 사용자를 찾을 수 없음 (ID):', payload.sub);
      return null;
    }
    console.log('✅ JWT 전략 - 사용자 찾음:', user.username);
    const { password, ...result } = user;
    return result;
  }
} 