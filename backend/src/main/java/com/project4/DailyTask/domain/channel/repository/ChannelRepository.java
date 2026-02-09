package com.project4.DailyTask.domain.channel.repository;


import com.project4.DailyTask.domain.channel.dto.ChannelListRes;
import com.project4.DailyTask.domain.channel.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    Optional<Channel> findByIdAndTeamId(Long channelId, Long teamId);

    @Query("""
            select new com.project4.DailyTask.domain.channel.dto.ChannelListRes(
               c.id,
               c.name,
               t.name,
               c.createdAt
            )
            from Channel c
            join c.team t
            where c.team.id = :teamId
            order by c.createdAt desc
            """)
    List<ChannelListRes> findChannelListByTeamId1(@Param("teamId") Long teamId);
}
