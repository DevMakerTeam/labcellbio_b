// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../admin/admin.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.adminRepo.findOne({ where: { username } });
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;
    // 비밀번호 맞으면 user 정보 리턴 (비밀번호 제외)
    const { password: _, ...result } = user;
    return result;
  }

  async findUserById(id: number) {
    return this.adminRepo.findOneBy({ id });
  }
}
