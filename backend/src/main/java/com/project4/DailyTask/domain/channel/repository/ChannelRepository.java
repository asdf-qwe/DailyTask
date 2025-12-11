package com.project4.DailyTask.domain.channel.repository;

import com.project4.DailyTask.domain.channel.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findAllByTeamId(Long teamId);
}
