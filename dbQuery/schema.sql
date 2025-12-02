CREATE TABLE Users (
	id VARCHAR(10) PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL
);

CREATE TABLE Students (
	NPM VARCHAR(10) PRIMARY KEY,
	totalGuidanceUTS INT NOT NULL DEFAULT 0,
	totalGuidanceUAS INT NOT NULL DEFAULT 0,
	FOREIGN KEY (NPM) REFERENCES Users(id)
);

CREATE TABLE Lecturers (
	lecturerCode VARCHAR(10) PRIMARY KEY,
	FOREIGN KEY (lecturerCode) REFERENCES Users(id)
);

CREATE TABLE Inbox (
	inbox_ID SERIAL PRIMARY KEY,
	date DATE NOT NULL,
	time TIME NOT NULL,
	msgType VARCHAR(255) NOT NULL,
	message VARCHAR(255) NOT NULL
);

CREATE TABLE Akademik(
	akademik_ID SERIAL PRIMARY KEY,
	year VARCHAR(4) NOT NULL,
	semester VARCHAR(6) NOT NULL
);

CREATE TABLE StudentSchedule(
	NPM VARCHAR,
	akademik_ID SERIAL NOT NULL,
	day VARCHAR(10) NOT NULL,
	hourStart TIME NOT NULL,
	hourEnd TIME NOT NULL,
	FOREIGN KEY (NPM) REFERENCES Students(NPM),
	FOREIGN KEY (akademik_id) REFERENCES Akademik(akademik_id)
);

CREATE TABLE LecturerSchedule(
	lecturerCode VARCHAR(10),
	akademik_ID SERIAL NOT NULL,
	day VARCHAR(10) NOT NULL,
	hourStart TIME NOT NULL,
	hourEnd TIME NOT NULL,
	FOREIGN KEY (lecturerCode) REFERENCES Lecturers(lecturerCode),
	FOREIGN KEY (akademik_id) REFERENCES Akademik(akademik_id)
);

CREATE TABLE Topic(
	topicCode VARCHAR(10) PRIMARY KEY,
	NPM VARCHAR,
	lecturerCode VARCHAR(10),
	topicName VARCHAR(255) NOT NULL,
	FOREIGN KEY (NPM) REFERENCES Students(NPM),
	FOREIGN KEY (lecturerCode) REFERENCES Lecturers(lecturerCode)
);

CREATE TABLE GuidanceSchedule(
	guidance_ID SERIAL PRIMARY KEY,
	topicCode VARCHAR(10),
	day VARCHAR(10) NOT NULL,
	hourStart TIME NOT NULL,
	hourEnd TIME NOT NULL,
	notes TEXT NOT NULL,
	place VARCHAR(255) NOT NULL,
	FOREIGN KEY (topicCode) REFERENCES Topic(topicCode)
);