package com.project4.DailyTask.domain.message.service;


import com.project4.DailyTask.domain.channel.entity.Channel;
import com.project4.DailyTask.domain.channel.repository.ChannelRepository;
import com.project4.DailyTask.domain.message.dto.MessageAuthor;
import com.project4.DailyTask.domain.message.dto.MessageRes;
import com.project4.DailyTask.domain.message.dto.SendMessageDto;
import com.project4.DailyTask.domain.message.entity.Message;
import com.project4.DailyTask.domain.message.repository.MessageRepository;
import com.project4.DailyTask.domain.notification.entity.NotificationType;
import com.project4.DailyTask.domain.notification.service.ApiV1NotificationService;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.user.entity.Status;
import com.project4.DailyTask.domain.user.entity.User;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.checker.TeamMemberChecker;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
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
    private final ApiV1NotificationService notificationService;
    private final TeamMemberChecker teamMemberChecker;

    @Transactional
    public MessageRes sendMessage(Long teamId, Long channelId, Long userId, SendMessageDto dto) {
        Channel channel = findChannelOrThrow(channelId);

        Long actualTeamId = channel.getTeam().getId();
        if (!actualTeamId.equals(teamId)) {
            throw new ApiException(ErrorCode.CHANNEL_MESSAGE_FORBIDDEN);
        }

        User sender = userRepository.findByIdAndStatus(userId, Status.ACTIVE)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        teamMemberChecker.requireJoined(actualTeamId, userId);

        Message message = new Message(
                channel,
                sender,
                dto.content(),
                sender.getNickname(),
                sender.getId()
        );
        messageRepository.save(message);

        createNotification(channel.getTeam(), sender, channelId);

        return new MessageRes(
                message.getId(),
                channelId,
                new MessageAuthor(sender.getId(), sender.getNickname()),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    private void createNotification(Team team, User user, Long channelId){
        List<Long> receiverIds = teamMemberRepository.findAllByTeamIdWithUser(team.getId()).stream()
                .filter(TeamMember::isJoined)
                .map(tm -> tm.getUser().getId())
                .filter(id -> !id.equals(user.getId()))
                .toList();

        if (!receiverIds.isEmpty()) {
            notificationService.createToMany(
                    receiverIds,
                    NotificationType.CHANNEL_MESSAGE,
                    user.getNickname() + "님이 메시지를 보냈습니다.",
                    channelId,
                    team.getId()
            );
        }
    }

    private Channel findChannelOrThrow(Long channelId){
        return channelRepository.findById(channelId)
                .orElseThrow(()-> new ApiException(ErrorCode.CHANNEL_NOT_FOUND));
    }

    @Transactional
    public List<MessageRes> getChatHistory(Long channelId, SecurityUser user){
        Channel channel = findChannelOrThrow(channelId);
        Team team = channel.getTeam();
        teamMemberChecker.requireReadableHistory(team.getId(), user.getId());
        return getMessages(channel);
    }

    private List<MessageRes> getMessages(Channel channel){
        return messageRepository.findByChannelOrderByCreatedAtDesc(channel, PageRequest.of(0, 50)).stream()
                .map(entity -> {
                    var u = entity.getUser();

                    Long authorId;
                    String authorName;

                    if (u == null) {
                        authorId = entity.getAuthorIdSnapshot();
                        authorName = entity.getAuthorNicknameSnapshot();
                    } else if (u.getStatus() == Status.DELETED) {
                        authorId = entity.getAuthorIdSnapshot();
                        authorName = "탈퇴한 사용자";
                    } else {
                        authorId = u.getId();
                        authorName = u.getNickname();
                    }

                    return new MessageRes(
                            entity.getId(),
                            channel.getId(),
                            new MessageAuthor(authorId, authorName),
                            entity.getContent(),
                            entity.getCreatedAt()
                    );
                })
                .toList();
    }

}
