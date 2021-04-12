package com.github.guru.qa.allure.notifications.model;

public class Time {
    private final Long duration;

    public Time(Long duration) {
        this.duration = duration;
    }

    public Long duration() {
        return duration;
    }
}
