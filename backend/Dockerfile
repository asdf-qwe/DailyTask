# ===== build stage =====
FROM gradle:jdk-21-and-23-graal-jammy AS builder
WORKDIR /app

# 필요한 것들 먼저 복사 (캐시용)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
# (있으면 자동으로 같이 복사돼도 상관없지만, 없으면 무시 안 됨)
# COPY gradle.properties .

RUN chmod +x gradlew

# 의존성/빌드 준비 (Spring Boot 플러그인 요구 버전은 wrapper가 해결)
RUN ./gradlew build -x test --no-daemon

# 소스 복사 후 실제 빌드
COPY src src
RUN ./gradlew build -x test --no-daemon

# ===== run stage =====
FROM container-registry.oracle.com/graalvm/jdk:23
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
