plugins {
	java
	id("org.springframework.boot") version "4.0.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.project4"
version = "0.0.1-SNAPSHOT"
description = "Demo project for Spring Boot"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-data-redis")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	compileOnly("org.projectlombok:lombok")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

	// db관련
	runtimeOnly("com.mysql:mysql-connector-j")

	// swagger
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.1")

	// JWT & JSON
	implementation("io.jsonwebtoken:jjwt-api:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
	implementation("com.google.code.gson:gson")

	implementation("org.jsoup:jsoup:1.17.2")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-websocket")

	testImplementation("com.h2database:h2")

	// --- test ---
	testCompileOnly("org.projectlombok:lombok")
	testAnnotationProcessor("org.projectlombok:lombok")

	// AWS SDK (S3 Presigned URL)
	implementation(platform("software.amazon.awssdk:bom:2.25.50"))
	implementation("software.amazon.awssdk:s3")
	implementation("software.amazon.awssdk:sts")

	// Querydsl (Spring Boot 3+/Jakarta)
	implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
	annotationProcessor("com.querydsl:querydsl-apt:5.0.0:jakarta")

	// Q 클래스 생성 안정화(환경에 따라 필요)
	annotationProcessor("jakarta.annotation:jakarta.annotation-api")
	annotationProcessor("jakarta.persistence:jakarta.persistence-api")
}


// Querydsl generated sources 경로 등록
val generated = file("build/generated/sources/annotationProcessor/java/main")

sourceSets {
	main {
		java {
			srcDir(generated)
		}
	}
}

tasks.withType<JavaCompile> {
	options.generatedSourceOutputDirectory.set(generated)
}

tasks.withType<Test> {
	useJUnitPlatform()
}
