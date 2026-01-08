package com.project4.DailyTask.domain.todo.repository;

import com.project4.DailyTask.domain.todo.entity.Todo;
import com.project4.DailyTask.domain.todo.entity.TodoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    @Query(value = """
    SELECT t
    FROM Todo t
    WHERE t.user.id = :userId
      AND t.team IS NULL
      AND (:status IS NULL OR t.todoStatus = :status)
      AND (:date IS NULL OR t.dueDate = :date)
    """,
            countQuery = """
    SELECT COUNT(t)
    FROM Todo t
    WHERE t.user.id = :userId
      AND t.team IS NULL
      AND (:status IS NULL OR t.todoStatus = :status)
      AND (:date IS NULL OR t.dueDate = :date)
    """
    )
    Page<Todo> searchMyTodos(
            @Param("userId") Long userId,
            @Param("date") LocalDate date,
            @Param("status") TodoStatus status,
            Pageable pageable
    );

    @Query(value = """
        SELECT t
        FROM Todo t
        WHERE t.team.id = :teamId
          AND (:status IS NULL OR t.todoStatus = :status)
          AND (:date IS NULL OR t.dueDate = :date)
        """,
            countQuery = """
        SELECT COUNT(t)
        FROM Todo t
        WHERE t.team.id = :teamId
          AND (:status IS NULL OR t.todoStatus = :status)
          AND (:date IS NULL OR t.dueDate = :date)
        """
    )
    Page<Todo> searchTeamTodos(
            @Param("teamId") Long teamId,
            @Param("date") LocalDate date,
            @Param("status") TodoStatus status,
            Pageable pageable
    );
}
