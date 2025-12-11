package com.project4.DailyTask.domain.message.service;


import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.channel.repository.ChannelRepository;
import com.project4.DailyTask.domain.memo.dtio.MemoRes;
import com.project4.DailyTask.domain.message.dto.MessageRes;
import com.project4.DailyTask.domain.message.dto.SendMessageDto;
import com.project4.DailyTask.domain.message.entity.Message;
import com.project4.DailyTask.domain.message.repository.MessageRepository;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1MessageService {
    private final MessageRepository messageRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void sendMessage(Long channelId, SecurityUser user, SendMessageDto dto){
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(()-> new ApiException(ErrorCode.CHANNEL_NOT_FOUND));

        Team team = channel.getTeam();
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user.getId());
        if (!isMember) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }

        Message message = Message.builder()
                .channel(channel)
                .user(userRepository.getReferenceById(user.getId()))
                .content(dto.getContent())
                .build();

        messageRepository.save(message);

        MessageRes res = new MessageRes(
                message.getId(),
                channelId,
                new MessageRes.Author(user.getId(), user.getNickname()),
                message.getContent(),
                message.getCreatedAt()
        );

        messagingTemplate.convertAndSend("/topic/channel/" + channelId, res);
    }

    @Transactional
    public List<MessageRes> getChatHistory(Long channelId, SecurityUser user){
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(()-> new ApiException(ErrorCode.CHANNEL_NOT_FOUND));

        Team team = channel.getTeam();
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user.getId());
        if (!isMember) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }

        return messageRepository.findTop50ByChannelOrderByCreatedAtDesc(channel).stream()
                .map(entity-> MessageRes.builder()
                        .id(entity.getId())
                        .channelId(channelId)
                        .author(new MessageRes.Author(entity.getUser().getId(),
                                entity.getUser().getNickname()))
                        .content(entity.getContent())
                        .createdAt(entity.getCreatedAt())
                        .build())
                .toList();
    }

}
