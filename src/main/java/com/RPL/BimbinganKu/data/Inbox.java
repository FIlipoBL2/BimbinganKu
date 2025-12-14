package com.RPL.BimbinganKu.data;

import java.time.LocalDate;
import java.time.LocalTime;

public class Inbox {
    private Long id;
    private LocalDate date;
    private LocalTime time;
    private String msgType; // 'read' or 'unread'
    private String message;
    private String userId;

    public Inbox() {}

    public Inbox(Long id, LocalDate date, LocalTime time, String msgType, String message, String userId) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.msgType = msgType;
        this.message = message;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public String getMsgType() { return msgType; }
    public void setMsgType(String msgType) { this.msgType = msgType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
