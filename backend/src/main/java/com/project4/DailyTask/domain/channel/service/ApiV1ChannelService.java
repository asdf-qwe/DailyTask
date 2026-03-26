package com.project4.DailyTask.domain.channel.service;

import com.project4.DailyTask.domain.channel.dto.ChannelListRes;
import com.project4.DailyTask.domain.channel.dto.CreateChannelReq;
import com.project4.DailyTask.domain.channel.dto.CreateChannelRes;
import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.channel.repository.ChannelRepository;
import com.project4.DailyTask.domain.message.repository.MessageRepository;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.global.checker.TeamMemberChecker;
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
    private final TeamMemberChecker teamMemberChecker;

    @Transactional
    public CreateChannelRes createChannel(Long teamId, SecurityUser user, CreateChannelReq req){
        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(teamId, user.getId());

        Channel channel = new Channel(teamMember.getTeam(), req.name());

        channelRepository.save(channel);

        return new CreateChannelRes(
                channel.getId(),
                channel.getTeam().getId(),
                channel.getName(),
                channel.getCreatedAt()
        );
    }


    public List<ChannelListRes> getChannelList(Long teamId, SecurityUser user){
        teamMemberChecker.findMemberOrThrow(teamId, user.getId());
        return channelRepository.findChannelListByTeamId1(teamId);
    }

    @Transactional
    public void deleteChannel(Long teamId, Long channelId, SecurityUser user) {
        TeamMember member = teamMemberChecker.findMemberOrThrow(teamId, user.getId());
        validateDeleteAuthority(member);

        Channel channel = findChannelOrThrow(channelId, teamId);
        channelRepository.delete(channel);
    }

    private void validateDeleteAuthority(TeamMember member) {
        if (!member.isOwner()) {
            throw new ApiException(ErrorCode.ONLY_OWNER_CAN_DELETE);
        }
    }

    private Channel findChannelOrThrow(Long channelId, Long teamId) {
        return channelRepository.findByIdAndTeamId(channelId, teamId)
                .orElseThrow(() -> new ApiException(ErrorCode.CHANNEL_NOT_FOUND));
    }

}

