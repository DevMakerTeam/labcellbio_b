import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  dotenv.config();

  const logger = new Logger('App');
  logger.log('애플리케이션 시작 중...');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // ★ 이게 있어야 유효성 검사 작동
  // ✅ CORS 설정
  app.enableCors({
    origin: true, // 또는 'http://localhost:3000'
    credentials: true, // ✔️ 이거 중요!
  });

  // 세션 미들웨어 등록
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60, // 1시간
      },
    }),
  );

  // passport 초기화 및 세션 사용
  app.use(passport.initialize());
  app.use(passport.session());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('LabCellBio API')
    .setDescription('LabCellBio 백엔드 API 문서')
    .setVersion('1.0')
    .addTag('uploads', '파일 업로드 관련 API')
    .addTag('auth', '인증 관련 API')
    .addTag('board', '게시판 관련 API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, '0.0.0.0');

  logger.log('✅ 서버가 포트 3000에서 실행 중입니다.');
  logger.log('✅ 데이터베이스 연결 확인 완료');
  logger.log('📚 Swagger 문서: http://localhost:3000/api');
}
bootstrap();
