# LabCellBio Backend 배포 가이드

## 개요
이 문서는 LabCellBio Backend 애플리케이션을 AWS EC2에 배포하는 방법을 설명합니다.

## 사전 요구사항

### 1. AWS 계정 및 리소스
- AWS 계정
- EC2 인스턴스 (Amazon Linux 2 권장)
- RDS MySQL 데이터베이스 (선택사항)
- S3 버킷 (파일 업로드 사용 시)

### 2. GitHub Secrets 설정
GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿들을 설정해야 합니다:

#### AWS 관련
- `AWS_ACCESS_KEY_ID`: AWS IAM 사용자의 Access Key ID
- `AWS_SECRET_ACCESS_KEY`: AWS IAM 사용자의 Secret Access Key

#### EC2 관련
- `EC2_HOST`: EC2 인스턴스의 퍼블릭 IP 또는 도메인
- `EC2_USERNAME`: EC2 사용자명 (보통 `ec2-user`)
- `EC2_SSH_KEY`: EC2 접속용 SSH 프라이빗 키 (전체 내용)
- `EC2_PORT`: SSH 포트 (기본값: 22)

#### 데이터베이스 관련
- `DB_HOST`: 데이터베이스 호스트 (RDS 엔드포인트 또는 EC2 내부 IP)
- `DB_PORT`: 데이터베이스 포트 (기본값: 3306)
- `DB_USERNAME`: 데이터베이스 사용자명
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `DB_DATABASE`: 데이터베이스명

#### 애플리케이션 관련
- `JWT_SECRET`: JWT 토큰 암호화 키
- `JWT_EXPIRES_IN`: JWT 토큰 만료 시간 (예: 1d, 7d)

#### S3 관련
- `AWS_S3_BUCKET`: S3 버킷명

## 배포 과정

### 1. EC2 인스턴스 설정

#### 보안 그룹 설정
- SSH (포트 22): 개발자 IP에서만 접근 허용
- HTTP (포트 80): 모든 IP에서 접근 허용
- HTTPS (포트 443): 모든 IP에서 접근 허용
- 애플리케이션 (포트 3000): 필요한 경우에만 허용

#### IAM 역할 설정
EC2 인스턴스에 다음 권한을 가진 IAM 역할을 연결 (S3 사용 시):
- AmazonS3ReadOnlyAccess

### 3. GitHub Actions 워크플로우

main 브랜치에 푸시하면 자동으로 다음 과정이 실행됩니다:

1. **테스트**: MySQL 컨테이너와 함께 테스트 실행
2. **소스 코드 전송**: EC2로 소스 코드 전송
3. **Docker 빌드**: EC2에서 Docker 이미지 빌드
4. **배포**: Docker Compose로 애플리케이션 실행

### 4. 수동 배포 (필요시)

EC2 인스턴스에 직접 접속하여 수동으로 배포할 수 있습니다:

```bash
# EC2에 SSH 접속
ssh -i your-key.pem ec2-user@your-ec2-ip

# Docker 설치 (이미 설치되어 있을 수 있음)
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 애플리케이션 실행
cd /home/ec2-user/app
docker-compose up -d --build
```

## 환경 변수 설정

### 로컬 개발
`.env.local` 파일을 생성하고 필요한 환경 변수를 설정:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=labcellbio
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your_s3_bucket
```

### 프로덕션
GitHub Secrets에 설정된 값들이 자동으로 사용됩니다.

## 모니터링 및 로그

### 컨테이너 상태 확인
```bash
docker ps
docker logs labcellbio-backend
```

### 애플리케이션 헬스 체크
```bash
curl http://your-ec2-ip:3000/health
```

### 로그 확인
```bash
# 실시간 로그 확인
docker logs -f labcellbio-backend

# 특정 시간 이후 로그
docker logs --since="2024-01-01T00:00:00" labcellbio-backend
```

## 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 실패**
   - 보안 그룹에서 데이터베이스 포트 허용 확인
   - 데이터베이스 서버 실행 상태 확인
   - 환경 변수 설정 확인

2. **Docker 이미지 빌드 실패**
   - Dockerfile 문법 확인
   - 의존성 설치 문제 확인

3. **EC2 배포 실패**
   - SSH 키 설정 확인
   - EC2 인스턴스 상태 확인
   - IAM 권한 확인

### 로그 확인 명령어
```bash
# GitHub Actions 로그
# GitHub 저장소 > Actions 탭에서 확인

# EC2 로그
docker logs labcellbio-backend
docker logs labcellbio-mysql

# 시스템 로그
sudo journalctl -u docker
```

## 롤백

이전 버전으로 롤백하려면:

```bash
# Git에서 이전 커밋으로 체크아웃
git checkout <previous-commit-hash>

# 소스 코드를 EC2로 다시 전송
# (GitHub Actions를 통해 자동으로 처리됨)

# 또는 수동으로 이전 버전 배포
cd /home/ec2-user/app
git checkout <previous-commit-hash>
docker-compose down
docker-compose up -d --build
```

## 보안 고려사항

1. **환경 변수**: 민감한 정보는 항상 GitHub Secrets 사용
2. **네트워크**: 필요한 포트만 열어두기
3. **업데이트**: 정기적인 보안 업데이트 적용
4. **백업**: 데이터베이스 정기 백업 설정
5. **모니터링**: 애플리케이션 상태 지속적 모니터링 