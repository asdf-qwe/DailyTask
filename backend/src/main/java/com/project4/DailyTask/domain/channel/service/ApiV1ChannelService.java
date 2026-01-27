package com.project4.DailyTask.domain.channel.service;

import com.project4.DailyTask.domain.channel.dto.ChannelListRes;
import com.project4.DailyTask.domain.channel.dto.CreateChannelReq;
import com.project4.DailyTask.domain.channel.dto.CreateChannelRes;
import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.channel.repository.ChannelRepository;
import com.project4.DailyTask.domain.message.repository.MessageRepository;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1ChannelService {
    private final ChannelRepository channelRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public CreateChannelRes createChannel(Long teamId, SecurityUser user, CreateChannelReq req){
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(()-> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        Channel channel = Channel.builder()
                .team(teamMember.getTeam())
                .name(req.name())
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
                        .teamName(channel.getTeam().getName())
                        .createdAt(channel.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteChannel(Long teamId, Long channelId, SecurityUser user) {
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(()-> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        if(teamMember.getRole() != Role.OWNER){
            throw new ApiException(ErrorCode.ONLY_OWNER_CAN_DELETE);
        }
        Channel channel = channelRepository.findByIdAndTeamId(channelId, teamId)
                .orElseThrow(() -> new ApiException(ErrorCode.CHANNEL_NOT_FOUND));

        int deleted = messageRepository.deleteAllByChannelId(channelId);


        channelRepository.delete(channel);


    }
}

