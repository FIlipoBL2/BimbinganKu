package com.RPL.BimbinganKu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RPL.BimbinganKu.data.Inbox;
import com.RPL.BimbinganKu.repository.InboxRepository;

@RestController
@RequestMapping("/api/inbox")
public class InboxRestController {

    @Autowired
    private InboxRepository inboxRepo;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Inbox>> getMessages(@PathVariable String userId) {
        return ResponseEntity.ok(inboxRepo.findByUserId(userId));
    }

    @PostMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            inboxRepo.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
