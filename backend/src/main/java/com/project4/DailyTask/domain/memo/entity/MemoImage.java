package com.project4.DailyTask.domain.memo.entity;

import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class MemoImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memo_id")
    private Memo memo;

    @Column(name = "image_url",length = 255)
    private String imageUrl;

}
