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

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;


    @Transactional
    public CreateTodoRes createTodo(SecurityUser user, CreateTodoReq req) {
        User ref = userRepository.getReferenceById(user.getId());

        Todo todo = Todo.createPersonalTodo(ref, req.title(), req.dueDate());

        Todo saved = todoRepository.save(todo);

        return new CreateTodoRes(saved.getId(), saved.getTitle(), saved.getDueDate(), saved.getTodoStatus());
    }


    @Transactional
    public CreateTeamTodoRes createTeamTodo(Long teamId, CreateTodoReq req, SecurityUser user) {

        // 권한/소속 검증
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        // 엔티티 생성 (도메인 메서드/팩토리 추천)
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

    public TodoListRes getTodoList(SecurityUser user,
                                   Pageable pageable,
                                   TodoSearchCond cond) {

        Page<Todo> todoPage = todoRepository.searchMyTodos(
                user.getId(),
                cond.getDate(),
                cond.getStatus(),
                pageable
        );

        List<TodoListRes.TodoSummary> content = todoPage.getContent().stream()
                .map(todo -> TodoListRes.TodoSummary.builder()
                        .id(todo.getId())
                        .title(todo.getTitle())
                        .dueDate(todo.getDueDate())
                        .todoStatus(todo.getTodoStatus())
                        .build())
                .toList();

        return TodoListRes.builder()
                .content(content)
                .page(todoPage.getNumber())
                .size(todoPage.getSize())
                .totalElements(todoPage.getTotalElements())
                .build();
    }


    public TodoListRes getTeamTodoList(Long teamId,
                                       SecurityUser user,
                                       Pageable pageable,
                                       TodoSearchCond cond) {

        teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND));

        Page<Todo> teamTodoPage = todoRepository.searchTeamTodos(
                teamId,
                cond.getDate(),
                cond.getStatus(),
                pageable
        );

        List<TodoListRes.TodoSummary> content = teamTodoPage.getContent().stream()
                .map(todo -> TodoListRes.TodoSummary.builder()
                        .id(todo.getId())
                        .title(todo.getTitle())
                        .dueDate(todo.getDueDate())
                        .todoStatus(todo.getTodoStatus())
                        .build())
                .toList();

        return TodoListRes.builder()
                .content(content)
                .page(teamTodoPage.getNumber())
                .size(teamTodoPage.getSize())
                .totalElements(teamTodoPage.getTotalElements())
                .build();
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

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(todo.getTeamId(), userId)
                .orElseThrow(() -> new ApiException(ErrorCode.ONLY_OWNER_CAN_UPDATE));

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
            throw new ApiException(ErrorCode.TODO_DELETE_FORBIDDEN); // (추천) delete 전용 코드
        }

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(todo.getTeamId(), userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TEAM_MEMBER_NOT_FOUND)); // (추천) 의미 일치

        if (!teamMember.isOwner()) {
            throw new ApiException(ErrorCode.TODO_DELETE_FORBIDDEN);
        }
    }
}
