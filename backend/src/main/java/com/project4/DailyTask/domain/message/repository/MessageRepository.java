package com.project4.DailyTask.domain.message.repository;

import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.message.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("""
select m from Message m
left join fetch m.user
where m.channel = :channel
order by m.createdAt desc
""")
    List<Message> findByChannelOrderByCreatedAtDesc(@Param("channel") Channel channel, Pageable pageable);


    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Message m set m.user = null where m.user.id = :userId")
    int detachUserFromMessages(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Message m where m.channel.id = :channelId")
    int deleteAllByChannelId(@Param("channelId") Long channelId);

}
