package com.project4.DailyTask.domain.channel.repository;

import com.project4.DailyTask.domain.channel.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findAllByTeamId(Long teamId);
    boolean existsByIdAndTeamId(Long channelId, Long teamId);
    Optional<Channel> findByIdAndTeamId(Long channelId, Long teamId);
}
