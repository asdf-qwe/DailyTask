package com.project4.DailyTask.domain.todo.service;

import com.project4.DailyTask.domain.team.entity.Role;
import com.project4.DailyTask.domain.team.entity.Team;
import com.project4.DailyTask.domain.team.entity.TeamMember;
import com.project4.DailyTask.domain.team.repository.TeamMemberRepository;
import com.project4.DailyTask.domain.todo.dto.*;
import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import com.project4.DailyTask.domain.todo.repository.TodoRepository;
import com.project4.DailyTask.domain.user.entity.User;
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
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApiV1TodoService {

    private final TeamMemberChecker teamMemberChecker;
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreateTodoRes createTodo(SecurityUser user, CreateTodoReq req) {
        User owner = userRepository.getReferenceById(user.getId());

        Todo todo = Todo.createPersonal(
                owner,
                req.title(),
                req.dueDate()
        );

        Todo saved = todoRepository.save(todo);

        return new CreateTodoRes(
                saved.getId(),
                saved.getTitle(),
                saved.getDueDate(),
                saved.getTodoStatus()
        );
    }

    @Transactional
    public CreateTeamTodoRes createTeamTodo(Long teamId, CreateTodoReq req, SecurityUser user) {
        TeamMember teamMember = teamMemberChecker.findTeamMemberWithRefsOrThrow(teamId, user.getId());

        Todo todo = Todo.createForTeam(
                teamMember.getUser(),
                teamMember.getTeam(),
                req.title(),
                req.dueDate()
        );

        Todo saved = todoRepository.save(todo);

        return new CreateTeamTodoRes(
                saved.getId(),
                saved.getTitle(),
                saved.getTeam().getId(),
                saved.getDueDate(),
                saved.getTodoStatus()
        );
    }

    public TodoListRes getTodoList(SecurityUser user, Pageable pageable, TodoSearchCond cond) {
        Page<TodoSummary> todoPage = todoRepository.searchMyTodos(
                user.getId(),
                cond.date(),
                cond.status(),
                pageable
        );

        return new TodoListRes(
                todoPage.getContent(),
                todoPage.getNumber(),
                todoPage.getSize(),
                todoPage.getTotalElements()
        );
    }

    public TodoListRes getTeamTodoList(Long teamId,
                                       SecurityUser user,
                                       Pageable pageable,
                                       TodoSearchCond cond) {
        teamMemberChecker.findMemberOrThrow(teamId, user.getId());

        Page<TodoSummary> todoPage = todoRepository.searchTeamTodos(
                teamId,
                cond.date(),
                cond.status(),
                pageable
        );

        return new TodoListRes(
                todoPage.getContent(),
                todoPage.getNumber(),
                todoPage.getSize(),
                todoPage.getTotalElements()
        );
    }

    @Transactional
    public UpdateTodoRes updateTodo(Long todoId, SecurityUser user, UpdateTodoReq req) {
        Todo todo = getTodoOrThrow(todoId);

        validateManagePermission(todo, user.getId(), ErrorCode.TODO_UPDATE_FORBIDDEN);

        if (req.title() != null) {
            todo.changeTitle(req.title());
        }
        if (req.date() != null) {
            todo.changeDueDate(req.date());
        }
        if (req.status() != null) {
            todo.changeStatus(req.status());
        }

        return new UpdateTodoRes(todo.getId(), todo.getUpdatedAt());
    }

    @Transactional
    public void deleteTodo(Long todoId, SecurityUser user) {
        Todo todo = getTodoOrThrow(todoId);

        validateManagePermission(todo, user.getId(), ErrorCode.TODO_DELETE_FORBIDDEN);

        todoRepository.delete(todo);
    }

    public List<TodoSummary> getTodoByDueDate(SecurityUser user) {
        return todoRepository.findByTodosOrderByDueDateAsc(
                user.getId(),
                LocalDate.now(),
                PageRequest.of(0, 5)
        );
    }

    public List<TodoSummary> getTeamTodoByDueDate(SecurityUser user) {
        List<Long> teamIds = teamMemberChecker.findMyTeamIds(user.getId());

        if (teamIds.isEmpty()) {
            return List.of();
        }

        return todoRepository.findByTeamTodosOrderByDueDateAsc(
                teamIds,
                LocalDate.now(),
                PageRequest.of(0, 5)
        );
    }

    private Todo getTodoOrThrow(Long todoId) {
        return todoRepository.findById(todoId)
                .orElseThrow(() -> new ApiException(ErrorCode.TODO_NOT_FOUND));
    }

    private void validateManagePermission(Todo todo, Long userId, ErrorCode errorCode) {
        if (todo.isOwnedBy(userId)) {
            return;
        }

        if (!todo.belongsToTeam()) {
            throw new ApiException(errorCode);
        }

        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(todo.teamIdOrNull(), userId);
        if (!teamMember.isOwner()) {
            throw new ApiException(errorCode);
        }
    }
}