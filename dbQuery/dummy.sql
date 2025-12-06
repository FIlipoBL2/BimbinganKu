-- ACADEMIC YEAR
INSERT INTO Akademik (year, semester) VALUES ('2023/2024', 'Genap');

-- LECTURERS
-- Note: Password is 'password123' hashed with BCrypt
-- Hash: $2a$10$wW.. (This is a valid hash for 'password123')
INSERT INTO Users (id, name, email, password) VALUES 
('CEN', 'C.E. Nugraheni', 'cen@unpar.ac.id', '$2a$10$UnXj.p/xY.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j'), -- Replace with real hash if needed, or see note below
('ELH', 'Elisati', 'elh@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'), -- Placeholder hash
('GDK', 'Gede Karya', 'gdk@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('HUH', 'Husnul', 'huh@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('KAL', 'Keenan', 'kal@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('LCA', 'Luciana', 'lca@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('LNV', 'Lionov', 'lnv@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('MTA', 'Mariskha', 'mta@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('MVC', 'Maria', 'mvc@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('PAN', 'Pascal', 'pan@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('RCP', 'Raymond', 'rcp@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('VAN', 'Vania', 'van@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('VSM', 'Veronica SM', 'vsm@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('NAT', 'Natalia', 'nat@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('ABS', 'Bagoes', 'abs@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('RDL', 'Rosa', 'rdl@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('JNH', 'Joanna Helga', 'jnh@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7'),
('ALB', 'Aldo', 'alb@unpar.ac.id', '$2a$10$eAccJf9TU.gej./.gm.YJe7');

-- NOTE: The hash '$2a$10$eAccJf9TU.gej./.gm.YJe7' is an example. 
-- For 'password123', you can use this hash if your encoder strength is 10:
-- $2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6
-- Updating all to valid 'password123' hash:
UPDATE Users SET password = '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6';


INSERT INTO Lecturers (lecturerCode) VALUES 
('CEN'), ('ELH'), ('GDK'), ('HUH'), ('KAL'), 
('LCA'), ('LNV'), ('MTA'), ('MVC'), ('PAN'), 
('RCP'), ('VAN'), ('VSM'), ('NAT'), ('ABS'), 
('RDL'), ('JNH'), ('ALB');

-- STUDENTS
INSERT INTO Users (id, name, email, password) VALUES 
('6182101001', 'Budi Santoso', '6182101001@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101002', 'Siti Aminah', '6182101002@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101003', 'Andi Pratama', '6182101003@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101004', 'Dewi Lestari', '6182101004@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6'),
('6182101005', 'Eko Purnomo', '6182101005@student.unpar.ac.id', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6');

INSERT INTO Students (npm, totalGuidanceUTS, totalGuidanceUAS) VALUES 
('6182101001', 2, 1),
('6182101002', 5, 3),
('6182101003', 0, 0),
('6182101004', 3, 3),
('6182101005', 1, 0);

-- TOPICS
INSERT INTO Topic (topicCode, npm, lecturerCode, topicName) VALUES 
('TA-001', '6182101001', 'CEN', 'Implementasi AI dalam Pertanian'),
('TA-002', '6182101002', 'LNV', 'Pengembangan Game Edukasi VR'),
('TA-003', '6182101003', 'MTA', 'Analisis Big Data Twitter'),
('TA-004', '6182101004', 'GDK', 'Sistem Keamanan Jaringan IoT'),
('TA-005', '6182101005', 'RDL', 'Aplikasi Mobile untuk Disabilitas');

-- WEEKLY SCHEDULES
-- Student 6182101001: Class on Monday & Wednesday
INSERT INTO StudentSchedule (npm, akademik_ID, day, hourStart, hourEnd) VALUES 
('6182101001', 1, 'Monday', '08:00', '10:00'),
('6182101001', 1, 'Wednesday', '13:00', '15:00');

-- Lecturer CEN: Teaching on Tuesday & Thursday
INSERT INTO LecturerSchedule (lecturerCode, akademik_ID, day, hourStart, hourEnd) VALUES 
('CEN', 1, 'Tuesday', '08:00', '10:00'),
('CEN', 1, 'Thursday', '10:00', '12:00');

-- GUIDANCE SESSIONS (Specific Dates)
-- Ensure these dates are in the future relative to when you test!
INSERT INTO GuidanceSchedule (topicCode, date, hourStart, hourEnd, notes, place) VALUES 
('TA-001', '2025-12-10', '09:00', '10:00', 'Bab 1 Review', 'Ruang Dosen CEN'),
('TA-001', '2025-12-17', '09:00', '10:00', 'Bab 2 Discussion', 'Ruang Dosen CEN'),
('TA-002', '2025-12-11', '14:00', '15:00', 'Game Design Doc', 'Lab VR'),
('TA-005', '2025-12-12', '10:00', '11:00', 'Requirement Gathering', 'Online Meet');