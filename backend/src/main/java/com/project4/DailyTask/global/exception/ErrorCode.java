package com.project4.DailyTask.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 400 BAD_REQUEST (잘못된 요청)
    TEAM_NAME_REQUIRED(HttpStatus.BAD_REQUEST, "팀 이름이 없습니다."),
    INVALID_INVITE_CODE(HttpStatus.BAD_REQUEST, "잘못된 초대 코드입니다."),
    OWNER_CANNOT_LEAVE(HttpStatus.BAD_REQUEST, "관리자는 팀 탈퇴를 할 수 없습니다."),
    MEMO_REQUIRED_FIELDS(HttpStatus.BAD_REQUEST, "메모 생성시 필수값이 누락되었습니다."),
    MEMO_NOT_FOUND_FOR_COMMENT(HttpStatus.BAD_REQUEST, "메모가 없어 댓글을 달 수 없습니다."),
    TODO_TITLE_REQUIRED(HttpStatus.BAD_REQUEST, "제목이 없어 TODO를 생성할 수 없습니다."),
    FILE_SIZE_EXCEEDED(HttpStatus.BAD_REQUEST, "업로드 할 파일 용량이 초과되었습니다."),
    ALREADY_TEAM_MEMBER(HttpStatus.BAD_REQUEST, "중복 초대입니다."),

    // 401 UNAUTHORIZED (인증 필요)
    ADMIN_AUTH_REQUIRED(HttpStatus.UNAUTHORIZED, "관리자 인증이 필요합니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),

    // 403 FORBIDDEN (권한 없음)
    ADMIN_PERMISSION_REQUIRED(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다."),
    TEAM_MEMBER_ONLY(HttpStatus.FORBIDDEN, "팀 멤버만 조회할 수 있습니다."),
    ONLY_ADMIN_CAN_KICK(HttpStatus.FORBIDDEN, "관리자만 팀원 강퇴를 할 수 있습니다."),
    ONLY_AUTHOR_CAN_UPDATE(HttpStatus.FORBIDDEN, "작성자만 수정할 수 있습니다."),
    ONLY_AUTHOR_CAN_DELETE(HttpStatus.FORBIDDEN, "작성자만 삭제할 수 있습니다."),
    TODO_CREATE_FORBIDDEN(HttpStatus.FORBIDDEN, "할 일을 생성할 권한이 없습니다."),
    TODO_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "팀원이나 본인만 할 일 수정이 가능합니다."),
    TODO_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "팀원이나 본인만 할 일 삭제가 가능합니다."),

    // 404 NOT_FOUND (존재하지 않음)
    MEMO_NOT_FOUND(HttpStatus.NOT_FOUND, "메모가 없습니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "읽을 알림이 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 팀입니다."),
    CODE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 코드입니다."),

    // 410 GONE (영구적으로 만료됨)
    INVITE_CODE_EXPIRED(HttpStatus.GONE, "만료된 코드입니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
