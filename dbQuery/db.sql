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

-- AKADEMIK: Stores active year/semester
CREATE TABLE Akademik (
    akademik_ID SERIAL PRIMARY KEY,
    year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL
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
    FOREIGN KEY (topicCode) REFERENCES Topic(topicCode) ON DELETE CASCADE
);

-- =============================================
-- INSERT DUMMY DATA
-- =============================================

-- AKADEMIK: Academic Year/Semester
INSERT INTO Akademik (year, semester) VALUES 
('2024/2025', 'Ganjil'),
('2024/2025', 'Genap');

-- =============================================
-- USERS TABLE (Base for all users)
-- =============================================

-- LECTURERS as Users
INSERT INTO Users (id, name, email, password) VALUES 
('CEN', 'C.E. Nugraheni', 'cen@unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('KAP', 'Kapi Kapibara', 'kapi@unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('LNV', 'Lionov', 'lnv@unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('MTA', 'Mariskha', 'mta@unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('GDK', 'Gede Karya', 'gdk@unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6');

-- STUDENTS as Users
INSERT INTO Users (id, name, email, password) VALUES 
('6182101001', 'Wom Wombat', '6182101001@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101002', 'Budi Santoso', '6182101002@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101003', 'Siti Aminah', '6182101003@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101004', 'Andi Pratama', '6182101004@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101005', 'Dewi Lestari', '6182101005@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6');

-- =============================================
-- LECTURERS TABLE
-- =============================================
INSERT INTO Lecturers (lecturerCode) VALUES 
('CEN'), ('KAP'), ('LNV'), ('MTA'), ('GDK');

-- =============================================
-- STUDENTS TABLE
-- =============================================
INSERT INTO Students (npm, totalGuidanceUTS, totalGuidanceUAS) VALUES 
('6182101001', 3, 2),  -- Wom Wombat
('6182101002', 2, 1),
('6182101003', 4, 3),
('6182101004', 1, 0),
('6182101005', 5, 4);

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
('TA-001', '6182101001', 'KAP', 'Implementasi Machine Learning untuk Prediksi Poop Wombat'),  -- Wom with Kapi
('TA-002', '6182101002', 'CEN', 'Pengembangan Aplikasi Mobile E-Commerce'),
('TA-003', '6182101003', 'LNV', 'Analisis Sentimen Media Sosial dengan NLP'),
('TA-004', '6182101004', 'MTA', 'Sistem Rekomendasi Film Berbasis AI'),
('TA-005', '6182101005', 'GDK', 'Keamanan Siber pada Aplikasi Web');

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
('GDK', 1, 'Friday', '13:00', '15:00');

-- =============================================
-- GUIDANCE SCHEDULE TABLE (Specific Guidance Sessions)
-- =============================================
INSERT INTO GuidanceSchedule (topicCode, date, hourStart, hourEnd, notes, place) VALUES 
-- Wom's sessions with Kapi
('TA-001', '2025-12-10', '09:00', '10:00', 'Review proposal dan timeline', 'Ruang Dosen KAP'),
('TA-001', '2025-12-17', '09:00', '10:00', 'Diskusi Bab 1 - Pendahuluan', 'Ruang Dosen KAP'),
('TA-001', '2025-12-24', '14:00', '15:00', 'Review implementasi ML model', 'Lab Komputer'),
-- Budi's sessions
('TA-002', '2025-12-11', '10:00', '11:00', 'Review wireframe aplikasi', 'Ruang Dosen CEN'),
('TA-002', '2025-12-18', '10:00', '11:00', 'Diskusi database design', 'Online Meet'),
-- Siti's sessions
('TA-003', '2025-12-12', '14:00', '15:00', 'Analisis dataset Twitter', 'Lab NLP'),
('TA-003', '2025-12-19', '14:00', '15:00', 'Review hasil sentiment analysis', 'Online Meet'),
-- Andi's sessions
('TA-004', '2025-12-13', '09:00', '10:00', 'Proposal sistem rekomendasi', 'Ruang Dosen MTA'),
-- Dewi's sessions
('TA-005', '2025-12-14', '10:00', '11:00', 'Pentest planning', 'Lab Security'),
('TA-005', '2025-12-21', '10:00', '11:00', 'Review vulnerability report', 'Ruang Dosen GDK');

-- =============================================
-- TEST CREDENTIALS SUMMARY:
-- Admin: admin / admin123 (hardcoded in app)
-- Student: 6182101001@student.unpar.ac.id / password123 (Wom Wombat)
-- Lecturer: kapi@unpar.ac.id / password123 (Kapi Kapibara)
-- =============================================