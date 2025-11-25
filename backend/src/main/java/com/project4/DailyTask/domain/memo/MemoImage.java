package com.project4.DailyTask.domain.memo;

import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class MemoImage extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "memo_id")
    private Memo memo;

    @Column(name = "image_url",length = 255)
    private String imageUrl;
}
