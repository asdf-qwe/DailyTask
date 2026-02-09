package com.project4.DailyTask.domain.notification.repository;

import com.project4.DailyTask.domain.notification.dto.NotificationRes;
import com.project4.DailyTask.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :threshold")
    int deleteByCreatedAtBefore(@Param("threshold") LocalDateTime threshold);

    @Query("""
    select new com.project4.DailyTask.domain.notification.dto.NotificationRes(
    n.id, n.type, n.message, n.relatedMemoId, n.relatedTeamId, n.read, n.createdAt)
    from Notification n
    where n.user.id = :userId
      and (:onlyUnread = false or n.read = false)
    order by n.createdAt desc
""")
    List<NotificationRes> findNotifications(@Param("userId") Long userId,
                                            @Param("onlyUnread") boolean onlyUnread);


}
