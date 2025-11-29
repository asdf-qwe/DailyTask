package com.project4.DailyTask.domain.memo.entity;

import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class Memo extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "title",nullable = false, length = 100)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "visibility")
    @Enumerated(EnumType.STRING)
    private Visibility visibility = Visibility.PRIVATE;

    @OneToMany(mappedBy = "memo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MemoImage> images = new ArrayList<>();

}
