package com.project4.DailyTask.domain.todo.repository;

import com.project4.DailyTask.domain.todo.dto.CalendarRes;
import com.project4.DailyTask.domain.todo.dto.TodoSummary;
import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long>, TodoRepositoryCustom {

    @Query("""
            select new com.project4.DailyTask.domain.todo.dto.TodoSummary(
            t.id,
            null,
            t.title,
            t.dueDate,
            t.todoStatus
            )
            from Todo t
            where t.owner.id = :userId
              and t.team is null
              and t.dueDate = :today
            order by t.dueDate asc, t.id desc
            """)
    List<TodoSummary> findByTodosOrderByDueDateAsc(@Param("userId") Long userId, @Param("today") LocalDate today,
                                                   Pageable pageable);

    @Query("""
            select new com.project4.DailyTask.domain.todo.dto.CalendarRes(
            t.id,
            tm.id,
            tm.name,
            t.title,
            t.dueDate,
            t.todoStatus
            )
            from Todo t
            left join t.team tm
            where t.owner.id = :userId
            order By t.dueDate asc, t.id desc
            """)
    List<CalendarRes> findByCalendarTodoList(@Param("userId") Long userId);

    @Query("""
            select new com.project4.DailyTask.domain.todo.dto.TodoSummary(
            t.id,
            tm.name,
            t.title,
            t.dueDate,
            t.todoStatus
            )
            from Todo t
            join t.team tm
            where tm.id in :teamIds
                and t.dueDate = :today
            order by t.id desc
            """)
    List<TodoSummary> findByTeamTodosOrderByDueDateAsc(
            @Param("teamIds") List<Long> teamIds,
            @Param("today") LocalDate today,
            Pageable pageable
    );
}
