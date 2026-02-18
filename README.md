# DailyTask  
> 성능과 구조를 고려한 팀 협업 백엔드 시스템

---

## 프로젝트 소개

DailyTask는 팀 단위 협업 환경을 위한 백엔드 중심 API 서버입니다.

단순 CRUD 구현이 아니라,

- 역할 기반 권한 제어
- 요청 단위 로깅 추적
- QueryDSL 기반 동적 검색
- 성능 측정 및 개선 설계
- WebSocket 인증 연동
- Scheduler 기반 데이터 정리

를 포함한 **실무 지향 백엔드 아키텍처 설계**를 목표로 개발했습니다.

---

## 프로젝트 목표

이 프로젝트는 다음 질문에 답하기 위해 설계되었습니다.

- N+1 문제를 어떻게 감지할 것인가?
- 요청 단위로 DB 쿼리 수를 어떻게 추적할 것인가?
- WebSocket에서도 인증을 안전하게 처리할 수 있는가?
- 단순 기능 구현을 넘어 운영 관점을 고려했는가?

---

# 아키텍처 설계

### 구조적 특징

- 도메인 중심 패키지 분리
- Controller / Service / Repository 책임 분리
- QueryDSL Custom Repository 구현
- JWT 기반 인증/인가
- WebSocket + STOMP 인증 인터셉터 적용
- Scheduler 기반 데이터 정리
- S3 Presigned URL 업로드 구조

---

# 주요 기능

## 1️⃣ 팀 협업 도메인

- 팀 생성
- 초대 코드 발급
- 팀 참여
- 팀 멤버 권한 관리
- 채널 생성
- 채널 메시지 송수신 (WebSocket)

---

## 2️⃣ 메모 시스템

- 메모 CRUD
- Visibility 설정 (팀/개인)
- 검색 조건 기반 조회
- QueryDSL 동적 검색

---

## 3️⃣ Todo 시스템

- 개인/팀 Todo 생성
- 상태 변경
- 조건 검색 + 페이징
- QueryDSL 기반 정렬 처리

---

## 4️⃣ 알림 시스템

- 이벤트 기반 알림 생성
- 읽음 처리
- Scheduler 기반 정리

---

# 인증/보안 설계

- JWT Access / Refresh Token 구조
- CustomUserDetailsService 구현
- SecurityUser 설계
- RequestScope 기반 Rq 객체
- WebSocket STOMP 인증 인터셉터 적용

### 요청 단위 추적

- TraceIdFilter
- MDC 기반 로깅
- RequestLoggingFilter

→ 인증 실패 요청도 필터 단계에서 로그 추적 가능

---

# 성능 설계

이 프로젝트는 성능을 "측정 가능한 구조"로 설계했습니다.

## ✔ Hibernate Statistics 활용
- 쿼리 수 측정
- 실행 시간 측정

## ✔ TeamPerfService 구현
- 팀 단위 데이터 조회 성능 측정
- DB 쿼리 수 확인 가능

## ✔ QueryDSL 기반 조회 설계
- 동적 조건 처리
- Repository 책임 분리
- DTO Projection 전략 분리

---

# 테스트 전략

- Unit Test
- JPA Slice Test
- 성능 검증 테스트

테스트 예시:

- TeamPerfServiceTest
- TeamServiceUnitTest
- TodoRepositorySliceTest

---

# 인프라 설계

- Docker 기반 배포
- AWS S3 Presigned URL 업로드
- 프로파일 분리 (prod / test / perf)
- application-secret.yml 분리 관리

---

# 기술 스택

| 분류 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot |
| Security | Spring Security + JWT |
| ORM | JPA / Hibernate |
| Query | QueryDSL |
| DB | MySQL |
| Realtime | WebSocket + STOMP |
| Build | Gradle (Kotlin DSL) |
| Infra | Docker, AWS S3 |

---

# 설계에서 고민한 부분

### 1. Setter-less Entity 설계
→ 도메인 메서드를 통한 상태 변경

### 2. Record 기반 Request DTO
→ 불변 객체 설계

### 3. 초대 코드 재발급 정책
→ 기존 코드 삭제 vs 업데이트 전략 비교

### 4. SoftDelete vs HardDelete
→ Scheduler 기반 정리 설계

### 5. WebSocket 인증 흐름 통합
→ HTTP 인증과의 통합 전략 설계

---

# 이 프로젝트가 보여주는 역량

✔ 도메인 설계 능력  
✔ 성능 측정 및 개선 관점  
✔ 보안 설계 이해도  
✔ 로그 기반 문제 추적 설계  
✔ 실무형 구조 설계 능력  
✔ 운영 환경을 고려한 아키텍처 설계  

---

# 실행 방법

## 1️⃣ 로컬 실행

