import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  dotenv.config();

  const logger = new Logger('App');
  logger.log('애플리케이션 시작 중...');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // ★ 이게 있어야 유효성 검사 작동
  // ✅ CORS 설정
  app.enableCors({
    // origin: true, // 또는 'http://localhost:3000'
    origin: ['http://localhost:3000', 'https://labcellbio.vercel.app'],
    credentials: true, // ✔️ 이거 중요!
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('LabCellBio API')
    .setVersion('1.0')
    .addTag('인증 (Authentication)', 'JWT 기반 인증 관련 API')
    .addTag('uploads', '파일 업로드 관련 API')
    .addTag('board', '게시판 관련 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요. 로그인 API에서 발급받은 accessToken을 사용합니다.',
        in: 'header',
      },
      'bearer'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, '0.0.0.0');

  logger.log('✅ 서버가 포트 3000에서 실행 중입니다.');
  logger.log('✅ 데이터베이스 연결 확인 완료');
  logger.log('📚 Swagger 문서: http://localhost:3000/api');
}

bootstrap().catch((error) => {
  console.error('애플리케이션 시작 실패:', error);
  process.exit(1);
});
