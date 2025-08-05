// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../admin/admin.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.adminRepo.findOne({ where: { username } });
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;
    // 비밀번호 맞으면 user 정보 리턴 (비밀번호 제외)
    const { password: _unusedPassword, ...result } = user;
    return result;
  }

  async findUserById(id: number) {
    return this.adminRepo.findOneBy({ id });
  }

  generateToken(user: any) {
    const payload = { 
      username: (user as any).username as string, 
      sub: (user as any).id as number 
    };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.findUserById(payload.sub);
      if (!user) return null;
      
      const { password: _unusedPassword, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }
}
