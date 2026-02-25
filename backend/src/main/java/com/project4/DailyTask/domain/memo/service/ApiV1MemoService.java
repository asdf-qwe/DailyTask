package com.project4.DailyTask.domain.memo.service;

import com.project4.DailyTask.domain.memo.dto.*;
import com.project4.DailyTask.domain.memo.entity.Memo;
import com.project4.DailyTask.domain.memo.entity.Visibility;
import com.project4.DailyTask.domain.memo.repository.MemoRepository;
import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.todo.dto.TodoSummary;
import com.project4.DailyTask.domain.user.repository.UserRepository;
import com.project4.DailyTask.global.checker.TeamMemberChecker;
import com.project4.DailyTask.global.exception.ApiException;
import com.project4.DailyTask.global.exception.ErrorCode;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1MemoService {

    private final MemoRepository memoRepository;
    private final UserRepository userRepository;
    private final TeamMemberChecker teamMemberChecker;

    @Transactional
    public CreateMemoRes createMemo(Long teamId, SecurityUser user, CreateMemoReq req) {

        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(teamId, user.getId());

        Visibility visibility = Boolean.TRUE.equals(req.sharedToTeam())
                ? Visibility.TEAM
                : Visibility.PRIVATE;

        Memo memo = Memo.createMemo(userRepository.getReferenceById(user.getId()),teamMember.getTeam(),
                req.title(), req.content(),visibility);

        memoRepository.save(memo);

        return new CreateMemoRes(
                memo.getId(),
                teamMember.getTeam().getId(),
                memo.getTitle(),
                memo.getContent(),
                req.sharedToTeam(),
                new MemoAuthor(user.getId(), user.getNickname()),
                memo.getCreatedAt()
        );
    }

    public MemoListRes getMemoList(Long teamId,
                                   SecurityUser user,
                                   Pageable pageable,
                                   MemoSearchCond cond) {

        teamMemberChecker.findMemberOrThrow(teamId, user.getId());

        Page<MemoSummary> memoSummaryPage = memoRepository.searchMemo(
                teamId,
                user.getId(),          
                cond.authorId(),
                cond.startDate(),
                cond.endDate(),
                pageable
        );

        return new MemoListRes(
                memoSummaryPage.getContent(),
                memoSummaryPage.getNumber(),
                memoSummaryPage.getSize(),
                memoSummaryPage.getTotalElements()
        );
    }

    public MemoRes getMemo(Long memoId, SecurityUser user) {

        Memo memo = memoRepository.findMemoWithUser(memoId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMO_NOT_FOUND));

        teamMemberChecker.findMemberOrThrow(memo.getTeam().getId(), user.getId());

        if (memo.getVisibility() == Visibility.PRIVATE
                && !memo.getUser().getId().equals(user.getId())) {
            throw new ApiException(ErrorCode.MEMO_ACCESS_DENIED);
        }

        boolean sharedToTeam = memo.getVisibility() == Visibility.TEAM;

        return new MemoRes(
                memo.getId(),
                memo.getTeam().getId(),
                memo.getTitle(),
                memo.getContent(),
                new MemoAuthor(
                        memo.getUser().getId(),
                        memo.getUser().getNickname()
                ),
                sharedToTeam,
                memo.getCreatedAt()
        );
    }
    @Transactional
    public UpdateMemoRes updateMemo(UpdateMemoReq req, Long memoId, SecurityUser user) {

        Memo memo = findMemoOrThrow(memoId);

        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(memo.getTeam().getId(), user.getId());

        validateMemoAuthority(memo, teamMember, user.getId());

        memo.update(req.title(), req.content(), req.sharedToTeam());

        return new UpdateMemoRes(memo.getId(), memo.getTitle(), memo.getUpdatedAt());
    }

    @Transactional
    public void deleteMemo(Long memoId, SecurityUser user) {

        Memo memo = findMemoOrThrow(memoId);

        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(memo.getTeam().getId(), user.getId());

        validateMemoAuthority(memo, teamMember, user.getId());

        memoRepository.delete(memo);
    }

    private void validateMemoAuthority(Memo memo, TeamMember teamMember, Long actorId){
        if (!memo.isAuthor(actorId) && !teamMember.isOwner(Role.OWNER)) {
            throw new ApiException(ErrorCode.MEMO_DELETE_FORBIDDEN);
        }
    }

    private Memo findMemoOrThrow(Long memoId){
        return memoRepository.findById(memoId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMO_NOT_FOUND));
    }

    public List<RecentMemoRes> getMemosByCreatedDesc(SecurityUser user){
        List<Long> teamIds = teamMemberChecker.findMyTeamIds(user.getId());
        if (teamIds.isEmpty()) return List.of();

        return memoRepository.findRecentMemos(
                teamIds, PageRequest.of(0,3));
    }
}

