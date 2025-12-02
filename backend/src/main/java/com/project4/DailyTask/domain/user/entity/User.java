package com.project4.DailyTask.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project4.DailyTask.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SuperBuilder
public class User extends BaseEntity {

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(name = "password", nullable = false, length = 100)
    private String password;

    @Column(name = "nickname", nullable = false, length = 30)
    private String nickname;

    @Column(name = "profile_url", length = 255)
    private String profile_url;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(name = "refresh_token", length = 255)
    private String refreshToken;

    @Column(name = "user_role")
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;

    private LocalDateTime deletedAt;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }
}
