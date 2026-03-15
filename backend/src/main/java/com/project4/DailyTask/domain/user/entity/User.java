package com.project4.DailyTask.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Column(length = 255)
    private String profileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(length = 255)
    private String refreshToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "user_role")
    private UserRole role;

    private LocalDateTime deletedAt;

    public static User createNew(String loginId, String email, String encodedPw, String nickname) {
        User user = new User();
        user.loginId = loginId;
        user.email = email;
        user.password = encodedPw;
        user.nickname = nickname;
        user.profileUrl = "example";
        user.status = Status.ACTIVE;
        user.role = UserRole.USER;
        return user;
    }

    public boolean isDeleted() {
        return status == Status.DELETED;
    }

    public void updateRefreshToken(String token) {
        this.refreshToken = token;
    }

    public void withdraw(LocalDateTime now) {
        if (isDeleted()) return;
        this.status = Status.DELETED;
        this.deletedAt = now;
        this.refreshToken = null;
    }
}