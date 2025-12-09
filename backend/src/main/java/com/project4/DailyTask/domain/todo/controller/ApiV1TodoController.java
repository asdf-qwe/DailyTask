package com.project4.DailyTask.domain.todo.controller;

import com.project4.DailyTask.domain.todo.dto.*;
import com.project4.DailyTask.domain.todo.service.ApiV1TodoService;
import com.project4.DailyTask.global.response.ApiResponse;
import com.project4.DailyTask.global.security.auth.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ApiV1TodoController {
    private final ApiV1TodoService todoService;


    @PostMapping("/todos/my")
    public ResponseEntity<ApiResponse<CreateTodoRes>> createTodo(@RequestBody CreateTodoReq req,
                                                                 @AuthenticationPrincipal SecurityUser user){
        CreateTodoRes res = todoService.createTodo(user, req);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(res));
    }

    @PostMapping("/teams/{teamId}/todos")
    public ResponseEntity<ApiResponse<CreateTeamTodoRes>> createTeamTodo(@PathVariable Long teamId,
                                                                         @AuthenticationPrincipal SecurityUser user,
                                                                         @RequestBody CreateTodoReq req){
        CreateTeamTodoRes res = todoService.createTeamTodo(teamId, req, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(res));
    }

    @GetMapping("/todos/my")
    public ResponseEntity<ApiResponse<TodoListRes>> getTodo(@AuthenticationPrincipal SecurityUser user,
                                                            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC)
                                                            Pageable pageable,
                                                            @ModelAttribute TodoSearchCond cond){
        TodoListRes todoListRes = todoService.getTodoList(user, pageable, cond);

        return ResponseEntity.ok(ApiResponse.ok(todoListRes));
    }

    @GetMapping("/teams/{teamId}/todos")
    public ResponseEntity<ApiResponse<TodoListRes>> getTeamTodo(@PathVariable Long teamId,
                                                                @AuthenticationPrincipal SecurityUser user,
                                                                @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC)
                                                                Pageable pageable,
                                                                @ModelAttribute TodoSearchCond cond){
        TodoListRes res = todoService.getTeamTodoList(teamId, user, pageable, cond);

        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PatchMapping("/todos/{todoId}")
    public ResponseEntity<ApiResponse<UpdateTodoRes>> updateTodo(@PathVariable Long todoId,
                                                                 @AuthenticationPrincipal SecurityUser user,
                                                                 @RequestBody UpdateTodoReq req){
        UpdateTodoRes res = todoService.updateTodo(todoId, user, req);

        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @DeleteMapping("/todos/{todoId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteTodo(@PathVariable Long todoId,
                                                        @AuthenticationPrincipal SecurityUser user){
        todoService.deleteTodo(todoId, user);
        return ResponseEntity.ok(ApiResponse.ok(true));
    }


}
