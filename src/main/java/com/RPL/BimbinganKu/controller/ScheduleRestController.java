package com.RPL.BimbinganKu.controller;

import java.time.LocalDate;
import java.time.LocalTime;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RPL.BimbinganKu.data.Akademik;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.repository.AkademikRepository;
import com.RPL.BimbinganKu.repository.ScheduleRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;

@RestController
@RequestMapping("/api")
public class ScheduleRestController {

    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private AkademikRepository akademikRepo;

    @Autowired
    private com.RPL.BimbinganKu.repository.InboxRepository inboxRepo;

    @Autowired
    private com.RPL.BimbinganKu.repository.TopicRepository topicRepo;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/student/schedule/{npm}")
    public List<Map<String, Object>> getStudentSchedule(@PathVariable String npm) {
        return scheduleRepo.findScheduleByStudent(npm);
    }

    @GetMapping("/lecturer/schedule/{code}")
    public List<Map<String, Object>> getLecturerSchedule(@PathVariable String code) {
        return scheduleRepo.findScheduleByLecturer(code);
    }

    @GetMapping("/lecturer/students/{code}")
    public List<Student> getLecturerStudents(@PathVariable String code) {
        return studentRepo.findStudentsByLecturer(code);
    }

    @PostMapping("/student/session")
    public ResponseEntity<?> saveOrUpdateSession(@org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {
        try {
            String topicCode = null;
            if (payload.get("topicCode") != null) {
                 topicCode = payload.get("topicCode").toString();
            }
            
            String studentNpm = (String) payload.get("studentNpm");
            String date = (String) payload.get("date");
            String time = (String) payload.get("time");
            String endTime = (String) payload.get("endTime"); 
            
            // FIX: Default duration 1 hour if endTime missing
            if (endTime == null || endTime.isEmpty()) {
                try {
                    LocalTime startT = LocalTime.parse(time);
                    LocalTime endT = startT.plusHours(1);
                    endTime = endT.toString();
                } catch (Exception e) {
                    endTime = time; // Fallback to avoid crash, though DB might reject equal times? No, DB allows 0 duration maybe? Better to default.
                }
            }
            String location = (String) payload.get("location");
            String notes = (String) payload.get("notes");
            String additionalLecturer = (String) payload.get("additionalLecturer"); // Optional
            if (additionalLecturer != null && additionalLecturer.trim().isEmpty()) {
                additionalLecturer = null;
            }
            String idStr = (String) payload.get("id"); // If present, update
            
            // Validate existing logic...
            if (topicCode == null && studentNpm != null) {
                try {
                    String sql = "SELECT topicCode FROM Topic WHERE NPM = ? LIMIT 1";
                    topicCode = jdbcTemplate.queryForObject(sql, String.class, studentNpm);
                } catch (Exception e) {}
            }
            if (studentNpm == null && topicCode != null) {
                try {
                    studentNpm = jdbcTemplate.queryForObject("SELECT npm FROM Topic WHERE topicCode = ?", String.class, topicCode);
                } catch (Exception e) {}
            }
            
            String lecturerCode = null;
            if (studentNpm != null) {
                 lecturerCode = topicRepo.findLecturerCodeByNpm(studentNpm);
            }

            String initiator = (String) payload.get("initiator");
            String studentName = getName(studentNpm);
            String lecturerName = getName(lecturerCode);

            if (idStr != null && !idStr.isEmpty()) {
                // UPDATE
                Long id = Long.parseLong(idStr);
                
                // Track Changes
                Map<String, Object> oldSession = null;
                try {
                    // UPDATED: Include location and notes
                    String fetchSql = "SELECT date, hourStart, additionalLecturer, location, notes FROM GuidanceSchedule WHERE guidance_id = ?";
                     oldSession = jdbcTemplate.queryForMap(fetchSql, id);
                } catch(Exception e) {}

                scheduleRepo.updateGuidanceSchedule(id, topicCode, date, time, endTime, location, notes, additionalLecturer);
                
                // NOTIFY UPDATES
                if (studentNpm != null && lecturerCode != null && oldSession != null) {

                    // 1. Time / Date Change
                    String oldDate = oldSession.get("date").toString();
                    String oldTime = oldSession.get("hourstart").toString().substring(0, 5); 
                    
                    if (!oldDate.equals(date) || !oldTime.equals(time)) {
                        String msgDetail = "session schedule time from " + oldDate + " " + oldTime + " to " + date + " " + time + ".";
                        sendUpdateNotifications(studentNpm, lecturerCode, initiator, msgDetail, "the " + msgDetail);
                    }

                    // 2. Additional Lecturer Change
                    String oldAddLec = (String) oldSession.get("additionallecturer");
                    if (oldSession.containsKey("additionalLecturer")) oldAddLec = (String) oldSession.get("additionalLecturer"); // case sensitive check
                    if (oldAddLec == null) oldAddLec = "none";
                    String newAddLec = additionalLecturer == null ? "none" : additionalLecturer;
                    
                    if (!oldAddLec.equals(newAddLec)) {
                        String addLecName = newAddLec;
                        if (!"none".equals(newAddLec)) {
                             try {
                                 addLecName = jdbcTemplate.queryForObject("SELECT name FROM Users WHERE id = ?", String.class, newAddLec);
                             } catch(Exception e) { addLecName = newAddLec; }
                        }
                         String msgDetail = "additional lecturer to " + addLecName + ".";
                         sendUpdateNotifications(studentNpm, lecturerCode, initiator, msgDetail, msgDetail);
                    }

                    // 3. Location (Room) Change
                    String oldLocation = (String) oldSession.get("location");
                    if (oldLocation == null) oldLocation = "";
                    String newLocation = location == null ? "" : location;

                    if (!oldLocation.equals(newLocation)) {
                         String msgDetail = "location from " + oldLocation + " to " + newLocation + ".";
                         sendUpdateNotifications(studentNpm, lecturerCode, initiator, msgDetail, "the " + msgDetail);
                    }

                    // 4. Notes Change
                    String oldNotes = (String) oldSession.get("notes");
                    if (oldNotes == null) oldNotes = "";
                    String newNotes = notes == null ? "" : notes;
                    // Normalize line endings or trim to avoid false positives if needed, but simple check for now
                    if (!oldNotes.trim().equals(newNotes.trim())) {
                         String msgDetail = "session notes.";
                         sendUpdateNotifications(studentNpm, lecturerCode, initiator, msgDetail, msgDetail);
                    }
                }
                
                return ResponseEntity.ok(Map.of("message", "Session updated successfully"));
            } else {
                // CREATE
                scheduleRepo.saveGuidanceSchedule(topicCode, date, time, endTime, notes, location, additionalLecturer);

                // Increment guidance count
                if (studentNpm != null) {
                    incrementGuidanceCount(studentNpm);
                    
                    // NOTIFY CREATION
                    if (lecturerCode != null) {
                         String msgForStudent = "";
                         String msgForLecturer = "";
                         
                         if ("lecturer".equalsIgnoreCase(initiator)) {
                             // Lecturer created
                             msgForStudent = "Lecturer " + lecturerName + " has scheduled a new guidance session on " + date + " at " + time + ".";
                             msgForLecturer = "You have scheduled a new guidance session with " + studentName + " on " + date + " at " + time + ".";
                             
                             createInboxMessage(studentNpm, msgForStudent, "unread");
                             createInboxMessage(lecturerCode, msgForLecturer, "unread");

                         } else {
                             // Student created (Default)
                             msgForLecturer = "New guidance session request from " + studentName + " on " + date + " at " + time + ".";
                             msgForStudent = "You have requested a guidance session with " + lecturerName + " on " + date + " at " + time + ".";

                             createInboxMessage(lecturerCode, msgForLecturer, "unread");
                             createInboxMessage(studentNpm, msgForStudent, "unread");
                         }
                    }
                }

                return ResponseEntity.ok(Map.of("message", "Session created successfully"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private void sendUpdateNotifications(String studentNpm, String lecturerCode, String initiator, String msgDetailRaw, String msgDetailContext) {
        String studentName = getName(studentNpm);
        String lecturerName = getName(lecturerCode);
        
        String msgForStudent = "";
        String msgForLecturer = "";

        if ("student".equalsIgnoreCase(initiator)) {
             msgForStudent = "You have changed " + msgDetailContext;
             msgForLecturer = "Student " + studentName + " has changed " + msgDetailContext;
        } else if ("lecturer".equalsIgnoreCase(initiator)) {
             msgForStudent = "Lecturer " + lecturerName + " has changed " + msgDetailContext;
             msgForLecturer = "You have changed " + msgDetailContext;
        } else {
             msgForStudent = "Session update: " + msgDetailRaw;
             msgForLecturer = "Session update: " + msgDetailRaw; 
        }

        createInboxMessage(studentNpm, msgForStudent, "unread");
        createInboxMessage(lecturerCode, msgForLecturer, "unread");
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam(required = false) String initiator) {
        try {
            // Get session info before deleting to notify
            String studentNpm = null;
            String lecturerCode = null;
            String date = "";
            try {
                String sql = "SELECT t.npm, t.lecturerCode, gs.date FROM GuidanceSchedule gs JOIN Topic t ON gs.topicCode = t.topicCode WHERE gs.guidance_id = ?";
                Map<String, Object> result = jdbcTemplate.queryForMap(sql, id);
                studentNpm = (String) result.get("npm");
                lecturerCode = (String) result.get("lecturerCode");
                date = result.get("date").toString();
            } catch (Exception e) {
                // ignore
            }

            String deleteSql = "DELETE FROM GuidanceSchedule WHERE guidance_id = ?";
            int rows = jdbcTemplate.update(deleteSql, id);

            if (rows > 0) {
                // Decrement guidance count
                if (studentNpm != null) {
                    decrementGuidanceCount(studentNpm);
                    
                    // NOTIFY BOTH (Deletion is significant)
                    String studentName = getName(studentNpm);
                    String lecturerName = getName(lecturerCode);
                    
                    String msgForStudent = "";
                    String msgForLecturer = "";

                    if ("student".equalsIgnoreCase(initiator)) {
                        // Student initiated
                        msgForStudent = "You have deleted the session with Lecturer " + lecturerName + " on " + date + ".";
                        msgForLecturer = "Student " + studentName + " has deleted the session on " + date + ".";
                    } else if ("lecturer".equalsIgnoreCase(initiator)) {
                        // Lecturer initiated
                        msgForStudent = "Lecturer " + lecturerName + " has deleted the session on " + date + ".";
                        msgForLecturer = "You have deleted the session with Student " + studentName + " on " + date + ".";
                    } else {
                        // Fallback / Unknown
                        msgForStudent = "Session with Lecturer " + lecturerName + " on " + date + " has been deleted.";
                        msgForLecturer = "Session with Student " + studentName + " on " + date + " has been deleted.";
                    }
                    
                    createInboxMessage(studentNpm, msgForStudent, "unread");
                    if (lecturerCode != null) {
                         createInboxMessage(lecturerCode, msgForLecturer, "unread");
                    }
                }
                return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    private void createInboxMessage(String userId, String message, String status) {
        try {
            com.RPL.BimbinganKu.data.Inbox inbox = new com.RPL.BimbinganKu.data.Inbox();
            inbox.setDate(LocalDate.now());
            inbox.setTime(LocalTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS));
            inbox.setMessage(message);
            inbox.setMsgType(status);
            inbox.setUserId(userId);
            inboxRepo.save(inbox);
        } catch (Exception e) {
            System.err.println("Failed to create inbox message: " + e.getMessage());
        }
    }

    /**
     * Increment guidance count based on current academic period.
     * - If current date is before UTS deadline: increment totalGuidanceUTS
     * - If current date is after UTS deadline but before UAS deadline: increment
     * totalGuidanceUAS
     * - Otherwise: no change (outside semester)
     */
    private void incrementGuidanceCount(String npm) {
        Akademik ak = akademikRepo.findCurrentAkademik().orElse(null);
        if (ak == null)
            return;

        LocalDate today = LocalDate.now();
        LocalDate semStart = ak.getSemesterStart();
        LocalDate utsEnd = ak.getUtsDeadline();
        LocalDate uasEnd = ak.getUasDeadline();

        if (semStart != null && today.isBefore(semStart)) {
            // Before semester starts - no count
            return;
        }

        if (utsEnd != null && !today.isAfter(utsEnd)) {
            // In UTS period (semStart <= today <= utsEnd)
            jdbcTemplate.update("UPDATE Students SET totalGuidanceUTS = totalGuidanceUTS + 1 WHERE npm = ?", npm);
        } else if (uasEnd != null && !today.isAfter(uasEnd)) {
            // In UAS period (utsEnd < today <= uasEnd)
            jdbcTemplate.update("UPDATE Students SET totalGuidanceUAS = totalGuidanceUAS + 1 WHERE npm = ?", npm);
        }
        // After UAS deadline - no count
    }

    /**
     * Decrement guidance count based on current academic period.
     */
    private void decrementGuidanceCount(String npm) {
        Akademik ak = akademikRepo.findCurrentAkademik().orElse(null);
        if (ak == null)
            return;

        LocalDate today = LocalDate.now();
        LocalDate semStart = ak.getSemesterStart();
        LocalDate utsEnd = ak.getUtsDeadline();
        LocalDate uasEnd = ak.getUasDeadline();

        if (semStart != null && today.isBefore(semStart)) {
            return;
        }

        if (utsEnd != null && !today.isAfter(utsEnd)) {
            jdbcTemplate.update(
                    "UPDATE Students SET totalGuidanceUTS = GREATEST(0, totalGuidanceUTS - 1) WHERE npm = ?", npm);
        } else if (uasEnd != null && !today.isAfter(uasEnd)) {
            jdbcTemplate.update(
                    "UPDATE Students SET totalGuidanceUAS = GREATEST(0, totalGuidanceUAS - 1) WHERE npm = ?", npm);
        }
    }

    private String getName(String userId) {
        if (userId == null) return "Unknown";
        try {
            return jdbcTemplate.queryForObject("SELECT name FROM Users WHERE id = ?", String.class, userId);
        } catch (Exception e) {
            return userId;
        }
    }
}