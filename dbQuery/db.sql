-- SCHEMA.sql

DROP TABLE IF EXISTS GuidanceSchedule CASCADE;
DROP TABLE IF EXISTS StudentSchedule CASCADE;
DROP TABLE IF EXISTS LecturerSchedule CASCADE;
DROP TABLE IF EXISTS Topic CASCADE;
DROP TABLE IF EXISTS Inbox CASCADE;
DROP TABLE IF EXISTS Students CASCADE;
DROP TABLE IF EXISTS Lecturers CASCADE;
DROP TABLE IF EXISTS Akademik CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- USERS: Base table for authentication
CREATE TABLE Users (
    id VARCHAR(50) PRIMARY KEY,       -- Changed to VARCHAR to support 'CEN' and '6182101005'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL    -- Stores BCrypt Hash
);

-- AKADEMIK: Stores active year/semester with timeframe boundaries
CREATE TABLE Akademik (
    akademik_ID SERIAL PRIMARY KEY,
    year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    semester_start DATE,              -- When semester begins
    uts_deadline DATE,                -- End of UTS period
    uas_deadline DATE                 -- End of UAS period (semester end)
);

-- STUDENTS: Extends Users
CREATE TABLE Students (
    npm VARCHAR(50) PRIMARY KEY,      -- Matches Users.id
    totalGuidanceUTS INT DEFAULT 0,
    totalGuidanceUAS INT DEFAULT 0,
    FOREIGN KEY (npm) REFERENCES Users(id) ON DELETE CASCADE
);

-- LECTURERS: Extends Users
CREATE TABLE Lecturers (
    lecturerCode VARCHAR(50) PRIMARY KEY, -- Matches Users.id
    FOREIGN KEY (lecturerCode) REFERENCES Users(id) ON DELETE CASCADE
);

-- INBOX: Notifications
CREATE TABLE Inbox (
    inbox_ID SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    msgType VARCHAR(50),
    message TEXT
);

-- TOPIC: Links Student <-> Lecturer
CREATE TABLE Topic (
    topicCode VARCHAR(20) PRIMARY KEY,
    npm VARCHAR(50) NOT NULL,
    lecturerCode VARCHAR(50) NOT NULL,
    topicName VARCHAR(255),
    FOREIGN KEY (npm) REFERENCES Students(npm) ON DELETE CASCADE,
    FOREIGN KEY (lecturerCode) REFERENCES Lecturers(lecturerCode) ON DELETE CASCADE
);

-- STUDENT SCHEDULE: Weekly Class Schedule
CREATE TABLE StudentSchedule (
    npm VARCHAR(50) NOT NULL,
    akademik_ID INT NOT NULL,
    day VARCHAR(20) NOT NULL,      -- e.g., 'Monday'
    hourStart TIME NOT NULL,
    hourEnd TIME NOT NULL,
    PRIMARY KEY (npm, akademik_ID, day, hourStart),
    FOREIGN KEY (npm) REFERENCES Students(npm) ON DELETE CASCADE,
    FOREIGN KEY (akademik_ID) REFERENCES Akademik(akademik_ID)
);

-- LECTURER SCHEDULE: Weekly Teaching Schedule
CREATE TABLE LecturerSchedule (
    lecturerCode VARCHAR(50) NOT NULL,
    akademik_ID INT NOT NULL,
    day VARCHAR(20) NOT NULL,
    hourStart TIME NOT NULL,
    hourEnd TIME NOT NULL,
    PRIMARY KEY (lecturerCode, akademik_ID, day, hourStart),
    FOREIGN KEY (lecturerCode) REFERENCES Lecturers(lecturerCode) ON DELETE CASCADE,
    FOREIGN KEY (akademik_ID) REFERENCES Akademik(akademik_ID)
);

-- GUIDANCE SCHEDULE: Specific Dates
CREATE TABLE GuidanceSchedule (
    guidance_id SERIAL PRIMARY KEY,
    topicCode VARCHAR(20) NOT NULL,
    date DATE NOT NULL,             -- Specific Date (e.g., 2025-12-05)
    hourStart TIME NOT NULL,
    hourEnd TIME NOT NULL,
    notes TEXT,
    place VARCHAR(100),
    additionalLecturer VARCHAR(50), -- New column for Co-Lecturer/Additional Lecturer
    FOREIGN KEY (topicCode) REFERENCES Topic(topicCode) ON DELETE CASCADE,
    FOREIGN KEY (additionalLecturer) REFERENCES Lecturers(lecturerCode) ON DELETE SET NULL
);

-- =============================================
-- INSERT DUMMY DATA
-- =============================================

-- AKADEMIK: Academic Year/Semester with timeframe
-- Semester Ganjil 2025/2026: Aug 2025 - Jan 2026
-- UTS period: Aug 18 - Oct 20 (before uts_deadline)
-- UAS period: Oct 21 - Jan 15 (after uts_deadline, before uas_deadline)
INSERT INTO Akademik (year, semester, semester_start, uts_deadline, uas_deadline) VALUES 
('2025/2026', 'Ganjil', '2025-08-18', '2025-10-20', '2026-01-15');

-- =============================================
-- USERS TABLE (Base for all users)
-- =============================================

-- LECTURERS as Users
INSERT INTO Users (id, name, email, password) VALUES 
('CEN', 'C.E. Nugraheni', 'cen@unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('KAP', 'Kapi Kapibara', 'kapi@unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('LNV', 'Lionov', 'lnv@unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('MTA', 'Mariskha', 'mta@unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('GDK', 'Gede Karya', 'gdk@unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('NAT', 'Natalia', 'nat@unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy');

-- STUDENTS as Users
INSERT INTO Users (id, name, email, password) VALUES 
('6182101001', 'Wom Wombat', '6182101001@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182101002', 'Budi Santoso', '6182101002@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182101003', 'Siti Aminah', '6182101003@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182101004', 'Andi Pratama', '6182101004@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182101005', 'Dewi Lestari', '6182101005@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182301004', 'Filipo Bintang Lautan', '6182301004@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182301032', 'Basilius Mozes', '6182301032@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182301024', 'Vince Farrel Natanael', '6182301024@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182301063', 'Antonius Revan Hariputera', '6182301063@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy'),
('6182101037', 'I Gusti Kamasan Putu Arsava Waradana', '6182101037@student.unpar.ac.id', '$2a$10$nq9UqQM4cXcWhnyM6mCukeYsW975/K.zPzuGjrL.0fV.v3gYpFDWy');

-- =============================================
-- LECTURERS TABLE
-- =============================================
INSERT INTO Lecturers (lecturerCode) VALUES 
('CEN'), ('KAP'), ('LNV'), ('MTA'), ('GDK'), ('NAT');

-- =============================================
-- STUDENTS TABLE
-- =============================================
INSERT INTO Students (npm, totalGuidanceUTS, totalGuidanceUAS) VALUES 
('6182101001', 3, 2),  -- Wom Wombat
('6182101002', 2, 1),
('6182101003', 4, 3),
('6182101004', 1, 0),
('6182101005', 5, 4),
('6182301004', 2, 1),
('6182301032', 3, 2),
('6182301024', 1, 0),
('6182301063', 4, 3),
('6182101037', 2, 2);

-- =============================================
-- INBOX TABLE (Notifications)
-- =============================================
INSERT INTO Inbox (date, time, msgType, message) VALUES 
('2025-12-09', '08:00:00', 'reminder', 'Jangan lupa bimbingan hari ini!'),
('2025-12-09', '09:30:00', 'info', 'Jadwal bimbingan minggu depan sudah tersedia'),
('2025-12-08', '14:00:00', 'alert', 'Deadline pengumpulan Bab 2: 15 Desember 2025'),
('2025-12-07', '10:00:00', 'reminder', 'Revisi Bab 1 sudah selesai direview'),
('2025-12-06', '16:00:00', 'info', 'Selamat datang di BimbinganKu!');

-- =============================================
-- TOPIC TABLE (Links Student <-> Lecturer)
-- =============================================
INSERT INTO Topic (topicCode, npm, lecturerCode, topicName) VALUES 
('KAP-1', '6182101001', 'KAP', 'Implementasi Machine Learning untuk Prediksi Poop Wombat'),  -- Wom with Kapi
('CEN-1', '6182101002', 'CEN', 'Pengembangan Aplikasi Mobile E-Commerce'),
('LNV-1', '6182101003', 'LNV', 'Analisis Sentimen Media Sosial dengan NLP'),
('MTA-1', '6182101004', 'MTA', 'Sistem Rekomendasi Film Berbasis AI'),
('GDK-1', '6182101005', 'GDK', 'Keamanan Siber pada Aplikasi Web'),
('KAP-2', '6182301004', 'KAP', 'Optimasi Algoritma Genetika untuk Jadwal Kuliah'),
('CEN-2', '6182301032', 'CEN', 'Rancang Bangun Sistem Smart Home Berbasis IoT'),
('LNV-2', '6182301024', 'LNV', 'Penerapan Blockchain untuk Rekam Medis'),
('MTA-2', '6182301063', 'MTA', 'Analisis Performa Jaringan 5G'),
('GDK-2', '6182101037', 'GDK', 'Deteksi Intrusi Menggunakan Deep Learning');

-- =============================================
-- STUDENT SCHEDULE TABLE (Weekly Class Schedule)
-- =============================================
INSERT INTO StudentSchedule (npm, akademik_ID, day, hourStart, hourEnd) VALUES 
-- Wom Wombat's schedule
('6182101001', 1, 'Monday', '08:00', '10:00'),
('6182101001', 1, 'Monday', '13:00', '15:00'),
('6182101001', 1, 'Wednesday', '10:00', '12:00'),
('6182101001', 1, 'Friday', '08:00', '10:00'),
-- Budi's schedule
('6182101002', 1, 'Tuesday', '08:00', '10:00'),
('6182101002', 1, 'Thursday', '13:00', '15:00'),
-- Siti's schedule
('6182101003', 1, 'Monday', '10:00', '12:00'),
('6182101003', 1, 'Wednesday', '08:00', '10:00'),
-- Andi's schedule
('6182101004', 1, 'Tuesday', '10:00', '12:00'),
('6182101004', 1, 'Thursday', '08:00', '10:00'),
-- Dewi's schedule
('6182101005', 1, 'Wednesday', '13:00', '15:00'),
('6182101005', 1, 'Friday', '10:00', '12:00');

-- =============================================
-- LECTURER SCHEDULE TABLE (Weekly Teaching Schedule)
-- =============================================
INSERT INTO LecturerSchedule (lecturerCode, akademik_ID, day, hourStart, hourEnd) VALUES 
-- Kapi Kapibara's schedule
('KAP', 1, 'Monday', '09:00', '11:00'),
('KAP', 1, 'Wednesday', '14:00', '16:00'),
('KAP', 1, 'Friday', '09:00', '11:00'),
-- CEN's schedule
('CEN', 1, 'Tuesday', '08:00', '10:00'),
('CEN', 1, 'Thursday', '10:00', '12:00'),
-- Lionov's schedule
('LNV', 1, 'Monday', '13:00', '15:00'),
('LNV', 1, 'Wednesday', '08:00', '10:00'),
-- Mariskha's schedule
('MTA', 1, 'Tuesday', '13:00', '15:00'),
('MTA', 1, 'Thursday', '08:00', '10:00'),
-- Gede's schedule
('GDK', 1, 'Wednesday', '10:00', '12:00'),
('GDK', 1, 'Friday', '13:00', '15:00'),
-- Natalia's schedule (Additional Lecturer - No Topics)
('NAT', 1, 'Monday', '08:00', '10:00'),
('NAT', 1, 'Wednesday', '08:00', '10:00');

-- =============================================
-- GUIDANCE SCHEDULE TABLE (Specific Guidance Sessions)
-- =============================================
INSERT INTO GuidanceSchedule (topicCode, date, hourStart, hourEnd, notes, place, additionalLecturer) VALUES 
-- KAP-1 (Wom)
('KAP-1', '2025-12-10', '09:00', '10:00', 'Review proposal dan timeline', 'Ruang Dosen KAP', 'NAT'), -- NAT joins
('KAP-1', '2025-12-17', '09:00', '10:00', 'Diskusi Bab 1 - Pendahuluan', 'Ruang Dosen KAP', NULL),
-- KAP-2 (Filipo)
('KAP-2', '2025-12-11', '13:00', '14:00', 'Diskusi algoritma genetika', 'Ruang Dosen KAP', NULL),
('KAP-2', '2025-12-18', '13:00', '14:00', 'Review coding', 'Lab Komputer', NULL),
-- CEN-1 (Budi)
('CEN-1', '2025-12-11', '10:00', '11:00', 'Review wireframe aplikasi', 'Ruang Dosen CEN', 'NAT'), -- NAT joins
('CEN-1', '2025-12-18', '10:00', '11:00', 'Diskusi database design', 'Online Meet', NULL),
-- CEN-2 (Mozes)
('CEN-2', '2025-12-12', '10:00', '11:00', 'IoT Architecture review', 'Ruang Dosen CEN', NULL),
('CEN-2', '2025-12-19', '10:00', '11:00', 'Sensor selection', 'Lab IoT', NULL),
-- LNV-1 (Siti)
('LNV-1', '2025-12-12', '14:00', '15:00', 'Analisis dataset Twitter', 'Lab NLP', NULL),
('LNV-1', '2025-12-19', '14:00', '15:00', 'Review hasil sentiment analysis', 'Online Meet', NULL),

-- LNV-2 (Vince)
('LNV-2', '2025-12-13', '14:00', '15:00', 'Blockchain fundamentals', 'Ruang Dosen LNV', NULL),
('LNV-2', '2025-12-20', '14:00', '15:00', 'Smart contract logic', 'Online Meet', NULL),

-- MTA-1 (Andi)
('MTA-1', '2025-12-13', '09:00', '10:00', 'Proposal sistem rekomendasi', 'Ruang Dosen MTA', NULL),
('MTA-1', '2025-12-20', '09:00', '10:00', 'Collaborative filtering discussion', 'Online Meet', NULL),
-- MTA-2 (Antonius)
('MTA-2', '2025-12-10', '11:00', '12:00', '5G Network constraints', 'Ruang Dosen MTA', NULL),
('MTA-2', '2025-12-17', '11:00', '12:00', 'Simulation setup', 'Lab Jaringan', NULL),
-- GDK-1 (Dewi)
('GDK-1', '2025-12-14', '10:00', '11:00', 'Pentest planning', 'Lab Security', NULL),
('GDK-1', '2025-12-21', '10:00', '11:00', 'Review vulnerability report', 'Ruang Dosen GDK', NULL),
-- GDK-2 (I Gusti)
('GDK-2', '2025-12-11', '15:00', '16:00', 'Deep Learning model selection', 'Ruang Dosen GDK', NULL),
('GDK-2', '2025-12-18', '15:00', '16:00', 'Dataset preprocessing', 'Lab AI', NULL),

-- PAST SESSIONS (For History)
('KAP-1', '2025-12-01', '09:00', '10:00', 'Initial brainstorming', 'Ruang Dosen KAP', 'NAT'), -- NAT joined past session
('CEN-1', '2025-12-01', '10:00', '11:00', 'Idea validation', 'Ruang Dosen CEN', NULL),
('LNV-1', '2025-12-01', '14:00', '15:00', 'Data collection strategy', 'Lab NLP', NULL),
('MTA-1', '2025-12-01', '09:00', '10:00', 'Algorithm choice', 'Ruang Dosen MTA', NULL),
('GDK-1', '2025-12-01', '10:00', '11:00', 'Scope definition', 'Lab Security', NULL),
('KAP-2', '2025-12-01', '13:00', '14:00', 'Problem statement', 'Ruang Dosen KAP', NULL),
('CEN-2', '2025-12-01', '10:00', '11:00', 'Hardware list', 'Ruang Dosen CEN', NULL),
('LNV-2', '2025-12-01', '14:00', '15:00', 'Tech stack review', 'Ruang Dosen LNV', NULL),
('MTA-2', '2025-12-01', '11:00', '12:00', 'Literature review', 'Ruang Dosen MTA', NULL),
('GDK-2', '2025-12-01', '15:00', '16:00', 'Dataset search', 'Lab AI', NULL);


-- =============================================
-- TEST CREDENTIALS SUMMARY:
-- Admin: admin / admin123 (hardcoded in app)
-- Student: 6182101001@student.unpar.ac.id / password123 (Wom Wombat)
-- Lecturer: kapi@unpar.ac.id / password123 (Kapi Kapibara)
-- =============================================