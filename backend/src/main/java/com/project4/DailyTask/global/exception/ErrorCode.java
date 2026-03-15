package com.project4.DailyTask.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 400 BAD_REQUEST (잘못된 요청 / Validation 실패)
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    TODO_STATUS_REQUIRED(HttpStatus.BAD_REQUEST,"Todo 상태가 없습니다."),
    TEAM_NAME_REQUIRED(HttpStatus.BAD_REQUEST, "팀 이름이 없습니다."),
    INVALID_INVITE_CODE(HttpStatus.BAD_REQUEST, "잘못된 초대 코드입니다."),
    INVALID_USER_EMAIL(HttpStatus.BAD_REQUEST, "잘못된 이메일 형식입니다."),
    MEMO_REQUIRED_FIELDS(HttpStatus.BAD_REQUEST, "메모 생성시 필수값이 누락되었습니다."),
    TODO_TITLE_REQUIRED(HttpStatus.BAD_REQUEST, "제목이 없어 TODO를 생성할 수 없습니다."),
    UNSUPPORTED_SORT(HttpStatus.BAD_REQUEST, "지원되지 않는 정렬입니다."),
    TODO_TITLE_TOO_LONG(HttpStatus.BAD_REQUEST, "TODO 제목이 너무 깁니다."),
    MEMO_TITLE_TOO_LONG(HttpStatus.BAD_REQUEST, "MEMO 제목이 너무 깁니다."),
    TEAM_NAME_TOO_LONG(HttpStatus.BAD_REQUEST, "팀 이름이 너무 깁니다."),
    NOTIFICATION_ALREADY_READ(HttpStatus.BAD_REQUEST, "이미 읽었습니다."),

    // 401 UNAUTHORIZED (인증 실패)
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND,"리프레쉬 토큰이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    INVALID_LOGIN_ID(HttpStatus.UNAUTHORIZED, "아이디가 올바르지 않습니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    AUTHENTICATION_REQUIRED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),

    // 403 FORBIDDEN (권한 없음 / 정책상 금지)
    ADMIN_PERMISSION_REQUIRED(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다."),
    TEAM_MEMBER_ONLY(HttpStatus.FORBIDDEN, "팀 멤버만 조회할 수 있습니다."),
    ONLY_ADMIN_CAN_KICK(HttpStatus.FORBIDDEN, "관리자만 팀원 강퇴를 할 수 있습니다."),
    ONLY_OWNER_CAN_UPDATE(HttpStatus.FORBIDDEN, "관리자만 수정할 수 있습니다."),
    ONLY_OWNER_CAN_DELETE(HttpStatus.FORBIDDEN, "팀장만 삭제할 수 있습니다."),
    TODO_CREATE_FORBIDDEN(HttpStatus.FORBIDDEN, "할 일을 생성할 권한이 없습니다."),
    TODO_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "팀원이나 본인만 할 일 수정이 가능합니다."),
    TODO_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "팀원이나 본인만 할 일 삭제가 가능합니다."),
    MEMO_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "본인만 메모 수정이 가능합니다."),
    MEMO_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "팀장이나 본인만 메모 삭제가 가능합니다."),
    CHANNEL_MESSAGE_FORBIDDEN(HttpStatus.FORBIDDEN, "팀원만 메세지를 보낼 수 있습니다."),
    CANNOT_KICK_SELF(HttpStatus.FORBIDDEN, "관리자는 팀 탈퇴를 할 수 없습니다."),
    WITHDRAW_USER(HttpStatus.FORBIDDEN, "탈퇴한 유저입니다."),
    TEAM_MESSAGE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "팀 메시지 조회 권한이 없습니다."),
    MEMO_ACCESS_DENIED(HttpStatus.FORBIDDEN, "메모 조회 권한이 없습니다."),

    // 404 NOT_FOUND (존재하지 않음)
    MEMO_NOT_FOUND(HttpStatus.NOT_FOUND, "메모가 없습니다."),
    MEMO_NOT_FOUND_FOR_COMMENT(HttpStatus.NOT_FOUND, "메모가 없어 댓글을 달 수 없습니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "읽을 알림이 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    TODO_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 TODO 입니다."),
    TEAM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 팀입니다."),
    CHANNEL_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 채널입니다."),
    CODE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 코드입니다."),
    TEAM_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 팀원입니다."),

    // 409 CONFLICT (중복 / 상태 충돌)
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 등록된 이메일입니다."),
    LOGIN_ID_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    ALREADY_TEAM_MEMBER(HttpStatus.CONFLICT, "중복 초대입니다1."),

    // 413 PAYLOAD_TOO_LARGE (파일 업로드 용량 초과)
    FILE_SIZE_EXCEEDED(HttpStatus.PAYLOAD_TOO_LARGE, "업로드 할 파일 용량이 초과되었습니다."),

    // 410 GONE (영구적으로 만료됨)
    INVITE_CODE_EXPIRED(HttpStatus.GONE, "만료된 코드입니다.");


    private final HttpStatus httpStatus;
    private final String message;
}
