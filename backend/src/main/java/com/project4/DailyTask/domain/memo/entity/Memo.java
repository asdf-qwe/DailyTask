package com.project4.DailyTask.domain.memo.entity;

import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Memo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "title",nullable = false, length = 100)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "visibility")
    @Enumerated(EnumType.STRING)
    private Visibility visibility = Visibility.PRIVATE;

    public void changeTitle(String title){
        String t = title.trim();
        if (t.isBlank()) {
            throw new ApiException(ErrorCode.MEMO_REQUIRED_FIELDS);
        }
        if (t.length() > 50){
            throw new ApiException(ErrorCode.MEMO_TITLE_TOO_LONG);
        }
        this.title = t;
    }

    public static Memo createMemo(User user, Team team, String title, String content, Visibility visibility){
        Memo memo = new Memo();
        memo.user = user;
        memo.team = team;
        memo.changeTitle(title);
        memo.content = content;
        memo.visibility = visibility;
        return memo;
    }
    public void update(String title, String content, Boolean sharedToTeam) {
        if (title != null) changeTitle(title);
        if (content != null) changeContent(content);
        if (sharedToTeam != null) changeVisibility(sharedToTeam ? Visibility.TEAM : Visibility.PRIVATE);
    }

    public void changeContent(String content) {
        this.content = content;
    }

    public void changeVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

    public boolean isAuthor(Long userId){
        return this.user != null && this.user.getId().equals(userId);
    }
}

