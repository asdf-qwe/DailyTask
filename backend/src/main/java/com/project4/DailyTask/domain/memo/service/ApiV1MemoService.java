package com.project4.DailyTask.domain.memo.service;

import com.project4.DailyTask.domain.memo.dtio.CreateMemoReq;
import com.project4.DailyTask.domain.memo.dtio.CreateMemoRes;
import com.project4.DailyTask.domain.memo.entity.Memo;
import com.project4.DailyTask.domain.memo.entity.MemoImage;
import com.project4.DailyTask.domain.memo.entity.Visibility;
import com.project4.DailyTask.domain.memo.repository.MemoImageRepository;
import com.project4.DailyTask.domain.memo.repository.MemoRepository;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.team.repository.TeamRepository;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1MemoService {
    private final MemoRepository memoRepository;
    private final MemoImageRepository memoImageRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Transactional
    public CreateMemoRes createMemo(Long teamId, SecurityUser user, CreateMemoReq req){

        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new ApiException(ErrorCode.MEMO_REQUIRED_FIELDS);
        }

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        Team team = teamMember.getTeam();

        Visibility visibility = req.getSharedToTeam()
                ? Visibility.TEAM
                : Visibility.PRIVATE;

        Memo memo = Memo.builder()
                .user(userRepository.getReferenceById(user.getId()))
                .team(team)
                .title(req.getTitle())
                .content(req.getContent())
                .visibility(visibility)
                .build();

        List<String> imageUrls = req.getImageUrls();

        if (imageUrls != null) {
            for (String url : imageUrls) {
                memo.getImages().add(
                        MemoImage.builder()
                                .memo(memo)
                                .imageUrl(url)
                                .build()
                );
            }
        }

        memoRepository.save(memo);

        return new CreateMemoRes(
                memo.getId(),
                team.getId(),
                memo.getTitle(),
                memo.getContent(),
                memo.getImages().stream()
                        .map(MemoImage::getImageUrl)
                        .toList(),
                req.getSharedToTeam(),
                new CreateMemoRes.Author(
                        user.getId(),
                        user.getNickname()
                ),
                memo.getCreatedAt()
        );
    }

}
