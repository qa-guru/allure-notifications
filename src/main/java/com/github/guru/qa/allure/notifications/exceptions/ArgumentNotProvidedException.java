package com.github.guru.qa.allure.notifications.exceptions;

public class ArgumentNotProvidedException extends RuntimeException {
    public ArgumentNotProvidedException(String argument) {
        super(String.format("Argument %s is not provided.", argument));
    }
}
