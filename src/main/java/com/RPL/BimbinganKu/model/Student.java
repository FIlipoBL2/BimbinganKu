package com.RPL.BimbinganKu.model;

/**
 * Model class for Student.
 * Note: 'Major' field is temporarily removed/omitted 
 * because it is not available from the JOIN query in StudentDAO.
 */
public class Student {

    private String npm;
    private String name;
    // private String major; // Removed: Not available from the current DAO query
    private int guidanceCount;

    // 1. Default Constructor (Good practice)
    public Student() {
    }

    // 2. CONSTRUCTOR MATCHING THE StudentDAO QUERY (The fix for the error)
    public Student(String npm, String name, int guidanceCount) {
        this.npm = npm;
        this.name = name;
        this.guidanceCount = guidanceCount;
    }

    // --- Getters and Setters ---

    public String getNpm() {
        return npm;
    }

    public void setNpm(String npm) {
        this.npm = npm;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getGuidanceCount() {
        return guidanceCount;
    }

    public void setGuidanceCount(int guidanceCount) {
        this.guidanceCount = guidanceCount;
    }
    
    // If you add the 'major' column back to the database and query later, 
    // you must re-add the field, constructor parameter, and getter/setter here.
}