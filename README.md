# Node.js Express 게시판

PostgreSQL을 사용하는 간단한 게시판 예제입니다.

## 기능

- 회원가입 / 로그인
- 게시글 작성, 조회, 수정, 삭제
- 글쓴이, 날짜, 제목, 내용

## 실행 방법

1. PostgreSQL에 `board` 데이터베이스를 생성합니다.

```sql
CREATE DATABASE board;
```

2. 아래 테이블을 생성합니다.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE Board2 (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. 패키지를 설치합니다.

```bash
npm install
```

4. `.env` 파일을 생성하고 데이터베이스 정보를 지정합니다.

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/board
SESSION_SECRET=your-secret
PORT=3000
```

5. 서버를 실행합니다.

```bash
npm start
```

6. 브라우저에서 `http://localhost:3000` 로 접속합니다.

## 개발

```bash
npm run dev
```
