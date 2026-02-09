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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        User ref = userRepository.getReferenceById(user.getId());

        Todo todo = Todo.createPersonalTodo(ref, req.title(), req.dueDate());

        Todo saved = todoRepository.save(todo);

        return new CreateTodoRes(saved.getId(), saved.getTitle(), saved.getDueDate(), saved.getTodoStatus());
    }


    @Transactional
    public CreateTeamTodoRes createTeamTodo(Long teamId, CreateTodoReq req, SecurityUser user) {

        TeamMember teamMember = teamMemberChecker.findTeamMemberWithRefsOrThrow(teamId,user.getId());

        Todo teamTodo = Todo.createTeamTodo(
                teamMember.getUser(),
                teamMember.getTeam(),
                req.title(),
                req.dueDate()
        );

        Todo saved = todoRepository.save(teamTodo);

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

        teamMemberChecker.findMemberOrThrow(teamId,user.getId());

        Page<TodoSummary> teamTodoPage = todoRepository.searchTeamTodos(
                teamId,
                cond.date(),
                cond.status(),
                pageable
        );

        return new TodoListRes(
                teamTodoPage.getContent(),
                teamTodoPage.getNumber(),
                teamTodoPage.getSize(),
                teamTodoPage.getTotalElements()
        );
    }

    @Transactional
    public UpdateTodoRes updateTodo(Long todoId, SecurityUser user, UpdateTodoReq req) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new ApiException(ErrorCode.TODO_NOT_FOUND));

        validateTodoUpdateAuthority(todo, user.getId());

        todo.applyUpdate(req.title(), req.date(), req.status());

        return new UpdateTodoRes(todo.getId(), todo.getUpdatedAt());
    }

    private void validateTodoUpdateAuthority(Todo todo, Long userId) {

        if (todo.isOwner(userId)) return;

        if (!todo.isTeamTodo()) {
            throw new ApiException(ErrorCode.TODO_UPDATE_FORBIDDEN);
        }

        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(todo.getTeamId(),userId);

        if (!teamMember.isOwner()) {
            throw new ApiException(ErrorCode.TODO_UPDATE_FORBIDDEN);
        }
    }

    @Transactional
    public void deleteTodo(Long todoId, SecurityUser user) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new ApiException(ErrorCode.TODO_NOT_FOUND));

        validateTodoDeleteAuthority(todo, user.getId());

        todoRepository.delete(todo);
    }

    private void validateTodoDeleteAuthority(Todo todo, Long userId) {

        if (todo.isOwner(userId)) return;

        if (!todo.isTeamTodo()) {
            throw new ApiException(ErrorCode.TODO_DELETE_FORBIDDEN);
        }

        TeamMember teamMember = teamMemberChecker.findMemberOrThrow(todo.getTeamId(),userId);

        if (!teamMember.isOwner()) {
            throw new ApiException(ErrorCode.TODO_DELETE_FORBIDDEN);
        }
    }
}
