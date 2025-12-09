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