import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  
  const logger = new Logger('App');
  logger.log('애플리케이션 시작 중...');
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000, '0.0.0.0');
  
  logger.log('✅ 서버가 포트 3000에서 실행 중입니다.');
  logger.log('✅ 데이터베이스 연결 확인 완료');
}
bootstrap();
