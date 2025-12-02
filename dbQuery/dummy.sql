-- Insert dummy data into Users table
-- All passwords are "password123" hashed with Bcrypt
INSERT INTO Users (name, email, password) VALUES 
('Gede Karyana', 'Gede@university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm'),
('Husnul Hakim', 'Husnul@university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm'),
('Elisati', 'Elisati@university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm'),
('Filipo Bintang Lautan', '6182301004@student.university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm'),
('Vince Farrel Nathaniel', '6182301024.brown@university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm'),
('Basilius Mozes', '6182301032@student.university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm'),
('Womby', '6182101099@student.university.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jbMFSm');

-- Insert dummy data into Students table
INSERT INTO Students (NPM, totalGuidanceUTS, totalGuidanceUAS) VALUES
(6182301004, 3, 2),
(6182301024, 2, 1),
(6182301032, 4, 3),
(6182101099, 0, 0);

-- Insert dummy data into Lecturers table
INSERT INTO Lecturers (lecturerCode) VALUES
('HUH'),
('GDK'),
('ELH');

-- Insert dummy data into Akademik table
INSERT INTO Akademik (year, semester) VALUES
('2024', 'Ganjil'),
('2024', 'Genap'),
('2023', 'Ganjil');

-- Insert dummy data into StudentSchedule table
INSERT INTO StudentSchedule (NPM, akademik_ID, day, hourStart, hourEnd) VALUES
(1, 1, 'Senin', '08:00:00', '10:00:00'),
(1, 1, 'Rabu', '10:00:00', '12:00:00'),
(2, 1, 'Selasa', '09:00:00', '11:00:00'),
(5, 2, 'Kamis', '13:00:00', '15:00:00');

-- Insert dummy data into LecturerSchedule table
INSERT INTO LecturerSchedule (lecturerCode, akademik_ID, day, hourStart, hourEnd) VALUES
('HUH', 1, 'Senin', '08:00:00', '12:00:00'),
('GDK', 1, 'Rabu', '14:00:00', '16:00:00'),
('ELH', 1, 'Selasa', '09:00:00', '13:00:00'),
('HUH', 2, 'Kamis', '10:00:00', '14:00:00');

-- Insert dummy data into Topic table
INSERT INTO Topic (topicCode, NPM, lecturerCode, topicName) VALUES
('GDK5801ADS', 6182301004, 'GDK', 'Web Development with Big Data'),
('HUH2101ACS', 6182301024, 'HUH', 'Database Design and Optimization'),
('ELH2390CCS', 6182301032, 'ELH', 'Mobile Application Development'),
('HUH2102BCS', 6182101099, 'HUH', 'RESTful API Design');

-- Insert dummy data into GuidanceSchedule table
INSERT INTO GuidanceSchedule (topicCode, day, hourStart, hourEnd, notes, place) VALUES
('GDK5801ADS', 'Senin', '08:00:00', '09:00:00', 'Discuss project architecture and framework selection', 'Room 1'),
('HUH2101ACS', 'Rabu', '10:00:00', '11:00:00', 'Review code and provide feedback', 'Room 2'),
('ELH2390CCS', 'Selasa', '09:00:00', '10:00:00', 'Database schema review', 'Room 3'),
('HUH2102BCS', 'Kamis', '13:00:00', '14:00:00', 'Discuss UI/UX design patterns', 'Room 2'),
('HUH2101ACS', 'Jumat', '11:00:00', '12:00:00', 'API testing and documentation review', 'Room 1');
