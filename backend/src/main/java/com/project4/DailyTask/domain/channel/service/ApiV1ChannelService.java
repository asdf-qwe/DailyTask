package com.project4.DailyTask.domain.channel.service;

import com.project4.DailyTask.domain.channel.dto.ChannelListRes;
import com.project4.DailyTask.domain.channel.dto.CreateChannelReq;
import com.project4.DailyTask.domain.channel.dto.CreateChannelRes;
import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.channel.repository.ChannelRepository;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1ChannelService {
    private final ChannelRepository channelRepository;
    private final TeamMemberRepository teamMemberRepository;


    @Transactional
    public CreateChannelRes createChannel(Long teamId, SecurityUser user, CreateChannelReq req){
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(()-> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        Channel channel = Channel.builder()
                .team(teamMember.getTeam())
                .name(req.getName())
                .build();

        channelRepository.save(channel);

        return new CreateChannelRes(
                channel.getId(),
                channel.getTeam().getId(),
                channel.getName(),
                channel.getCreatedAt()
        );
    }


    @Transactional
    public List<ChannelListRes> getChannelList(Long teamId, SecurityUser user){
        teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        return channelRepository.findAllByTeamId(teamId).stream()
                .map(channel -> ChannelListRes.builder()
                        .id(channel.getId())
                        .name(channel.getName())
                        .createdAt(channel.getCreatedAt())
                        .build())
                .toList();
    }
}
