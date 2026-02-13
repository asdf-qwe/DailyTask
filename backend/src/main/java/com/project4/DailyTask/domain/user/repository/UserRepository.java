package com.project4.DailyTask.domain.user.repository;

import com.project4.DailyTask.domain.user.dto.UserResponseDto;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByLoginId(String loginId);
    Optional<User> findByRefreshToken(String refreshToken);
    boolean existsByEmail(String email);
    boolean existsByLoginId(String loginId);
    Optional<User> findByIdAndStatus(Long id, Status status);
    List<User> findAllByStatusAndDeletedAtBefore(Status status, LocalDateTime localDateTime);

    @Query("""
            select new com.project4.DailyTask.domain.user.dto.UserResponseDto(
                u.id,
                u.email,
                u.nickname,
                u.role
            )
            from User u
            where u.id = :id
            """)
    Optional<UserResponseDto> findDtoById(@Param("id") Long id);
}
