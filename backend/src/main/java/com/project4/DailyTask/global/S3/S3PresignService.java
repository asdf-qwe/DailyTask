//package com.project4.DailyTask.global.S3;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//import java.time.Duration;
//
//import software.amazon.awssdk.services.s3.model.GetObjectRequest;
//import software.amazon.awssdk.services.s3.model.PutObjectRequest;
//import software.amazon.awssdk.services.s3.presigner.S3Presigner;
//import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
//import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
//
//@Service
//@RequiredArgsConstructor
//public class S3PresignService {
//
//    @Value("${cloud.aws.s3.bucket}")
//    private String bucket;
//
//    @Value("${app.s3.presign.put-minutes:10}")
//    private long putMinutes;
//
//    @Value("${app.s3.presign.get-minutes:5}")
//    private long getMinutes;
//
//    private final S3Presigner s3Presigner;
//
//    public PresignPutResult presignPut(String key, String contentType) {
//        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
//                .bucket(bucket)
//                .key(key)
//                .contentType(contentType)
//                .build();
//
//        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
//                .signatureDuration(Duration.ofMinutes(putMinutes))
//                .putObjectRequest(putObjectRequest)
//                .build();
//
//        var presigned = s3Presigner.presignPutObject(presignRequest);
//
//        return new PresignPutResult(key, presigned.url().toString());
//    }
//
//    public String presignGetUrl(String key) {
//        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
//                .bucket(bucket)
//                .key(key)
//                .build();
//
//        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
//                .signatureDuration(Duration.ofMinutes(getMinutes))
//                .getObjectRequest(getObjectRequest)
//                .build();
//
//        return s3Presigner.presignGetObject(presignRequest).url().toString();
//    }
//
//    public record PresignPutResult(String key, String uploadUrl) {}
//}
