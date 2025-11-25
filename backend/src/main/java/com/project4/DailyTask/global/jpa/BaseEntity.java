package com.project4.DailyTask.global.jpa;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@SuperBuilder
@MappedSuperclass // 이게 있어야 자식 엔티티에서 부모 필드를 쓸 수 있음
@NoArgsConstructor // JPA는 프록시 사용을 위해 기본 생성자(접근자 protected 조건 포함)가 반드시 필요함. 상속된 엔티티를 매핑할 때도 필요함.
@Getter
@Setter
@ToString
@EntityListeners(AuditingEntityListener.class) // @CreatedDate, @LastModifiedDate 등을 자동으로 채워줌.
public class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

}
