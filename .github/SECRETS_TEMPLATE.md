# GitHub Secrets 설정 가이드

이 문서는 GitHub Actions에서 사용할 Secrets 설정 방법을 설명합니다.

## 설정 방법

1. GitHub 저장소로 이동
2. Settings 탭 클릭
3. 왼쪽 메뉴에서 "Secrets and variables" > "Actions" 클릭
4. "New repository secret" 버튼 클릭
5. 각 시크릿을 추가

## 필요한 Secrets 목록

### AWS 관련
| Secret 이름 | 설명 | 예시 값 |
|-------------|------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM 사용자의 Access Key ID (S3 사용 시) | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM 사용자의 Secret Access Key (S3 사용 시) | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### EC2 관련
| Secret 이름 | 설명 | 예시 값 |
|-------------|------|---------|
| `EC2_HOST` | EC2 인스턴스의 퍼블릭 IP 또는 도메인 | `3.34.123.45` 또는 `your-domain.com` |
| `EC2_USERNAME` | EC2 사용자명 | `ec2-user` |
| `EC2_SSH_KEY` | EC2 접속용 SSH 프라이빗 키 (전체 내용) | `-----BEGIN RSA PRIVATE KEY-----...` |
| `EC2_PORT` | SSH 포트 | `22` |

### 데이터베이스 관련
| Secret 이름 | 설명 | 예시 값 |
|-------------|------|---------|
| `DB_HOST` | 데이터베이스 호스트 | `your-rds-endpoint.region.rds.amazonaws.com` |
| `DB_PORT` | 데이터베이스 포트 | `3306` |
| `DB_USERNAME` | 데이터베이스 사용자명 | `admin` |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | `your_secure_password` |
| `DB_DATABASE` | 데이터베이스명 | `labcellbio` |

### 애플리케이션 관련
| Secret 이름 | 설명 | 예시 값 |
|-------------|------|---------|
| `JWT_SECRET` | JWT 토큰 암호화 키 | `your_super_secret_jwt_key_here` |
| `JWT_EXPIRES_IN` | JWT 토큰 만료 시간 | `1d` 또는 `7d` |

### S3 관련
| Secret 이름 | 설명 | 예시 값 |
|-------------|------|---------|
| `AWS_S3_BUCKET` | S3 버킷명 | `labcellbio-uploads` |

## IAM 사용자 권한 설정

GitHub Actions에서 사용할 IAM 사용자는 다음 권한이 필요합니다 (S3 사용 시):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-s3-bucket/*"
        }
    ]
}
```


## 보안 주의사항

1. **Access Key 관리**: IAM 사용자의 Access Key는 정기적으로 교체
2. **최소 권한 원칙**: 필요한 권한만 부여
3. **키 노출 방지**: Access Key를 코드에 직접 작성하지 않음
4. **정기 감사**: 사용하지 않는 IAM 사용자 및 권한 정리

## 문제 해결

### 일반적인 오류

1. **"Access Denied" 오류**
   - IAM 사용자 권한 확인
   - Access Key 유효성 확인

2. **"Docker build failed" 오류**
   - Dockerfile 문법 확인
   - 소스 코드 전송 상태 확인

3. **"SSH connection failed" 오류**
   - EC2 인스턴스 상태 확인
   - SSH 키 형식 확인
   - 보안 그룹 설정 확인 