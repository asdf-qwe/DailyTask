# DailyTask  
> 팀 단위 협업 환경을 위한 팀 기반 협업 메모, 커뮤니케이션, Todo 관리 서비스 입니다.
---

## 1. 프로젝트 개요

DailyTask는 팀 기반 협업 서비스를 구현하면서 단순 CRUD를 넘어  
성능 병목 탐지, 요청 단위 로깅 설계, HTTP/WebSocket 통합 인증 구조 설계를 목표로 개발한 백엔드 중심 프로젝트입니다.

### 핵심 설계 목표

- N+1 문제를 재현하고 Hibernate Statistics로 수치화
- 요청 단위 DB 쿼리 수 추적 구조 설계
- HTTP / WebSocket 환경에서 일관된 인증 흐름 구현
- 운영 환경을 고려한 배포 및 구조 설계

---

## 2. 아키텍처 설계

### 계층 구조

Controller  
→ Service (비즈니스 로직)  
→ Repository (JPA / QueryDSL)  
→ MySQL  

### Cross-Cutting Layer

- JWT 기반 인증/인가
- WebSocket STOMP 인증 인터셉터
- OncePerRequestFilter 기반 요청 단위 추적
- MDC 기반 TraceId 로깅
- Scheduler 기반 데이터 정리

### 설계 원칙

- 도메인 중심 패키지 분리
- Controller / Service / Repository 책임 분리
- Setter-less Entity + 도메인 메서드 기반 상태 변경
- QueryDSL Custom Repository 구현

---

## 3. 성능 설계 및 개선

성능을 측정 가능한 구조로 설계했습니다.

### 1️⃣ N+1 문제 재현 및 개선

- 팀/메모 조회 시 N+1 상황 재현 API 구현
- Hibernate Statistics로 쿼리 수 및 실행 시간 측정
- Fetch Join 및 인덱스 적용 전/후 비교

### 2️⃣ 요청 단위 성능 추적 시스템

- TraceIdFilter를 통한 요청 단위 추적
- MDC 기반 로그 상관관계 유지
- 인증 실패 및 예외 상황에서도 로그 수집 가능

### 3️⃣ TeamPerfService 구현

- 팀 단위 데이터 조회 성능 측정
- 요청별 DB 쿼리 수 확인 가능

---

## 4. 인증 및 보안 설계

- JWT Access / Refresh Token 구조
- CustomUserDetailsService 구현
- SecurityUser 설계
- RequestScope 기반 Rq 객체 설계
- WebSocket STOMP 인증 인터셉터 적용

### 인증 흐름 통합

- HTTP 요청과 WebSocket 연결 시 동일한 JWT 검증 전략 사용
- 인증 실패 시 필터 단계에서 로그 추적 가능

---

## 5. 주요 기능

### 1️⃣ 팀 협업 도메인

- 팀 생성
- 초대 코드 발급 및 만료 정책
- 팀 참여
- OWNER / MEMBER 권한 분리
- 채널 생성
- WebSocket 기반 실시간 메시지 송수신

### 2️⃣ 메모 시스템

- 메모 CRUD
- Visibility (팀/개인) 정책 적용
- QueryDSL 기반 동적 검색
- 조건 기반 페이징 처리

### 3️⃣ Todo 시스템

- 개인/팀 Todo 생성
- 상태 변경
- 조건 검색 + 정렬 처리
- QueryDSL 기반 동적 조회

### 4️⃣ 알림 시스템

- 이벤트 기반 알림 생성
- 읽음 처리
- Scheduler 기반 데이터 정리

---

## 6. 테스트 전략

- Unit Test
- JPA Slice Test
- Integration Test

### Unit Test
도메인 로직을 독립적으로 검증하여 비즈니스 규칙이 의도대로 동작하는지 확인합니다.

### Slice Test
Repository 및 JPA 계층을 빠르게 검증하여 통합 테스트 비용을 줄입니다.

### Integration Test
전체 스프링 컨텍스트를 로딩하여 인증/인가, 트랜잭션, 필터, DB 연동까지 실제 서비스 흐름을 검증합니다.

---

## 7. 인프라 및 운영 설계

- Docker 기반 배포
- GitHub Actions CI/CD
- AWS EC2 운영
- HAProxy Reverse Proxy 구성
- HTTPS 적용
- 프로파일 분리 (prod / test / perf)
- application-secret.yml 분리 관리

---

## 8. 기술 스택

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
| Infra | Docker, AWS EC2, HAProxy |

---

## 9. 설계 과정에서의 고민

- Setter-less Entity 설계를 통한 도메인 중심 상태 관리
- Record 기반 Request DTO 설계로 불변성 유지
- 초대 코드 재발급 정책 (삭제 vs 갱신 전략 비교)
- SoftDelete vs HardDelete 전략 비교
- HTTP / WebSocket 인증 흐름 통합 설계

---

## 10. 이 프로젝트를 통해 증명한 역량

- 도메인 중심 설계 및 계층 책임 분리
- 성능 병목 재현 및 수치 기반 개선 경험
- 요청 단위 로깅 기반 문제 추적 설계
- JWT 기반 인증 및 WebSocket 통합 인증 설계
- 운영 환경을 고려한 CI/CD 및 배포 경험

---

## Live Demo

- Production URL: https://pofol.site  
- API Base URL: https://api.pofol.site
