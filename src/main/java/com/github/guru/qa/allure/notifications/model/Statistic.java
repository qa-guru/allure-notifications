package com.github.guru.qa.allure.notifications.model;

public class Statistic {
    private final Integer failed;
    private final Integer broken;
    private final Integer skipped;
    private final Integer passed;
    private final Integer unknown;
    private final Integer total;

    public Statistic(Integer failed, Integer broken, Integer skipped, Integer passed, Integer unknown, Integer total) {
        this.failed = failed;
        this.broken = broken;
        this.skipped = skipped;
        this.passed = passed;
        this.unknown = unknown;
        this.total = total;
    }

    public Integer failed() {
        return failed;
    }

    public Integer broken() {
        return broken;
    }

    public Integer skipped() {
        return skipped;
    }

    public Integer passed() {
        return passed;
    }

    public Integer unknown() {
        return unknown;
    }

    public Integer total() {
        return total;
    }
}
