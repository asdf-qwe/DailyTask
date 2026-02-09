# ===== build stage =====
FROM gradle:jdk-21-and-23-graal-jammy AS builder
WORKDIR /app

# 필요한 것들 먼저 복사 (캐시용)
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
# COPY gradle.properties .  # 있으면 켜도 됨

RUN chmod +x gradlew

# ✅ 여기서는 build 하지 말고 "의존성 다운로드"만 해서 캐시를 만든다
RUN ./gradlew dependencies --no-daemon

# 소스 복사 후 실제 빌드
COPY src src
RUN ./gradlew clean bootJar -x test --no-daemon

# ===== run stage =====
FROM container-registry.oracle.com/graalvm/jdk:23
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]

