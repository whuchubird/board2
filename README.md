# Board2

Node.js, Express, PostgreSQL로 만든 간단한 게시판입니다.

## 기능

- 회원가입, 로그인, 로그아웃
- 게시글 작성, 조회, 수정, 삭제
- PostgreSQL 기반 사용자, 게시글, 세션 저장
- 시작 시 데이터베이스 스키마 자동 생성
- Render용 상태 확인 엔드포인트 (`/health`)

## 로컬 실행

### 1. PostgreSQL 준비

PostgreSQL에 `board` 데이터베이스를 생성합니다. 테이블은 앱 시작 시 자동 생성됩니다.

```sql
CREATE DATABASE board;
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고 실제 값을 입력합니다.

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/board
SESSION_SECRET=충분히-길고-무작위인-값
PORT=3000
DB_POOL_MAX=10
```

`.env`는 Git에서 제외됩니다. 실제 비밀번호나 비밀값을 커밋하지 마세요.

### 3. 설치 및 실행

```bash
npm ci
npm start
```

브라우저에서 `http://localhost:3000`으로 접속합니다. `npm start`는 서버를 열기 전에 필요한 테이블을 자동으로 생성합니다.

스키마 생성만 별도로 실행하려면 다음 명령을 사용합니다.

```bash
npm run db:migrate
```

## Render 배포

### 새 서비스와 데이터베이스를 만드는 경우

저장소 루트의 `render.yaml`을 이용하면 Web Service, PostgreSQL, `DATABASE_URL`, `SESSION_SECRET`, 상태 확인 경로가 함께 구성됩니다.

1. 변경사항을 GitHub 저장소에 푸시합니다.
2. Render Dashboard에서 **New > Blueprint**를 선택합니다.
3. 이 저장소를 연결합니다.
4. Blueprint 내용을 확인한 뒤 배포합니다.

`render.yaml`은 싱가포르 리전의 무료 Web Service와 무료 PostgreSQL을 요청합니다. 계정이나 워크스페이스에서 무료 플랜을 선택할 수 없다면 `plan` 값을 Render에서 제공되는 유료 플랜으로 바꾸어야 합니다.

### 기존 Render 서비스를 계속 사용하는 경우

기존 Web Service를 새 Blueprint에 연결하면 리소스가 중복 생성될 수 있으므로 Dashboard에서 직접 다음 값을 설정합니다.

- Runtime: `Node`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/health`
- `NODE_ENV`: `production`
- `DATABASE_URL`: Render PostgreSQL의 **Internal Database URL**
- `SESSION_SECRET`: 길고 무작위인 비밀값

Web Service와 PostgreSQL은 같은 리전에 두는 것이 좋습니다. 배포가 시작되면 앱이 `users`, `board2`, `user_sessions` 테이블을 자동으로 준비합니다.

## 문제 해결

- `DATABASE_URL environment variable is required in production`: Render Web Service에 `DATABASE_URL`이 없습니다.
- `SESSION_SECRET environment variable is required in production`: Render Web Service에 `SESSION_SECRET`이 없습니다.
- `ECONNREFUSED ... 5432`: DB 주소가 잘못되었거나 로컬 주소를 사용하고 있습니다. Render의 Internal Database URL을 확인하세요.
- `Database migration failed`: 해당 URL의 DB 사용자에게 테이블 생성 권한이 있는지 확인하세요.
- `/health`가 `503`: 앱이 PostgreSQL에 연결하지 못하고 있습니다. Render 로그에서 바로 앞의 DB 오류를 확인하세요.

## 보안 메모

이미 실제 `.env` 값이 GitHub 등에 올라간 적이 있다면 파일을 지우는 것만으로는 충분하지 않습니다. PostgreSQL 비밀번호와 `SESSION_SECRET`을 새 값으로 교체하세요.
