package com.project4.DailyTask.domain.memo.service;

import com.project4.DailyTask.domain.memo.dto.*;
import com.project4.DailyTask.domain.memo.entity.Memo;
import com.project4.DailyTask.domain.memo.entity.Visibility;
import com.project4.DailyTask.domain.memo.repository.MemoRepository;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1MemoService {

    private final MemoRepository memoRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Transactional
    public CreateMemoRes createMemo(Long teamId, SecurityUser user, CreateMemoReq req) {

        if (req.title() == null || req.title().trim().isEmpty()) {
            throw new ApiException(ErrorCode.MEMO_REQUIRED_FIELDS);
        }

        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        Visibility visibility = Boolean.TRUE.equals(req.sharedToTeam())
                ? Visibility.TEAM
                : Visibility.PRIVATE;

        Memo memo = Memo.builder()
                .user(userRepository.getReferenceById(user.getId()))
                .team(teamMember.getTeam())
                .title(req.title())
                .content(req.content())
                .visibility(visibility)
                .build();

        memoRepository.save(memo);

        return new CreateMemoRes(
                memo.getId(),
                teamMember.getTeam().getId(),
                memo.getTitle(),
                memo.getContent(),
                req.sharedToTeam(),
                new CreateMemoRes.Author(user.getId(), user.getNickname()),
                memo.getCreatedAt()
        );
    }

    public MemoListRes getMemoList(Long teamId,
                                   SecurityUser user,
                                   Pageable pageable,
                                   MemoSearchCond cond) {

        teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        Page<Memo> memoPage = memoRepository.findMemoList(
                teamId,
                cond.getAuthorId(),
                cond.getStartDate(),
                cond.getEndDate(),
                pageable
        );

        List<MemoListRes.MemoSummary> content = memoPage.getContent().stream()
                .map(memo -> MemoListRes.MemoSummary.builder()
                        .id(memo.getId())
                        .title(memo.getTitle())
                        .preview(buildPreview(memo.getContent()))
                        .authorName(memo.getUser().getNickname())
                        .sharedToTeam(memo.getVisibility() == Visibility.TEAM)
                        .createdAt(memo.getCreatedAt())
                        .build())
                .toList();

        return MemoListRes.builder()
                .items(content)
                .page(memoPage.getNumber())
                .size(memoPage.getSize())
                .totalElements(memoPage.getTotalElements())
                .build();
    }

    private String buildPreview(String content) {
        if (content == null) return "";
        return content.length() > 40
                ? content.substring(0, 40) + "..."
                : content;
    }

    public MemoRes getMemo(Long memoId, SecurityUser user) {

        Memo memo = memoRepository.findById(memoId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMO_NOT_FOUND));

        teamMemberRepository.findByTeamIdAndUserId(
                memo.getTeam().getId(),
                user.getId()
        ).orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_ONLY));

        boolean sharedToTeam = memo.getVisibility() == Visibility.TEAM;

        return new MemoRes(
                memo.getId(),
                memo.getTeam().getId(),
                memo.getTitle(),
                memo.getContent(),
                new CreateMemoRes.Author(
                        memo.getUser().getId(),
                        memo.getUser().getNickname()
                ),
                sharedToTeam,
                memo.getCreatedAt()
        );
    }

    @Transactional
    public UpdateMemoRes updateMemo(UpdateMemoReq req, Long memoId, SecurityUser user) {

        Memo memo = memoRepository.findById(memoId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMO_NOT_FOUND));

        if (!user.getId().equals(memo.getUser().getId())) {
            throw new ApiException(ErrorCode.MEMO_UPDATE_FORBIDDEN);
        }

        memo.update(
                req.title(),
                req.content(),
                req.sharedToTeam()
        );

        return new UpdateMemoRes(
                memo.getId(),
                memo.getTitle(),
                memo.getUpdatedAt()
        );
    }

    @Transactional
    public void deleteMemo(Long memoId, SecurityUser user) {

        Memo memo = memoRepository.findById(memoId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMO_NOT_FOUND));

        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(memo.getTeam().getId(), user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        boolean isAuthor = user.getId().equals(memo.getUser().getId());
        boolean isOwner = teamMember.getRole() == Role.OWNER;

        if (!isAuthor && !isOwner) {
            throw new ApiException(ErrorCode.MEMO_DELETE_FORBIDDEN);
        }

        memoRepository.delete(memo);
    }
}

