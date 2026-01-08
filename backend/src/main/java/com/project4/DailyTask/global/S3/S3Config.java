package com.project4.DailyTask.global.S3;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3Config {

    @Value("${cloud.aws.region}")
    private String region;

    @Bean
    public software.amazon.awssdk.services.s3.presigner.S3Presigner s3Presigner() {
        return software.amazon.awssdk.services.s3.presigner.S3Presigner.builder()
                .region(software.amazon.awssdk.regions.Region.of(region))
                .build();
    }
}
