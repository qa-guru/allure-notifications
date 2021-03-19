package com.github.guru.qa.allure.notifications.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.guru.qa.allure.notifications.model.Summary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;

/**
 * Содержит вспомогательные методы для работы с JSON.
 * @author kadehar
 * @since 2.0.10
 */
public class JsonSlurper {
    private static final Logger LOGGER = LoggerFactory.getLogger(JsonSlurper.class);

    /**
     * Считывает summary.json в модель Summary
     * @param path путь к JSON файлу
     * @return итоговая информация из отчета
     */
    public static Summary readSummaryJson(final String path) {
        ObjectMapper mapper = new ObjectMapper();
        Summary summary = null;
        try {
            LOGGER.info("Reading json by path {}", path);
            summary = mapper.readValue(new File(path), Summary.class);
            LOGGER.info("Operation is finished successfully");
        } catch (IOException ex) {
            LOGGER.error("Error {} \n Reason {}", ex.getLocalizedMessage(), ex.getStackTrace());
            ex.printStackTrace();
            System.exit(1);
        }
        return summary;
    }
}