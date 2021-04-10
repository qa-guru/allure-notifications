package com.github.guru.qa.allure.notifications.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.guru.qa.allure.notifications.model.Summary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * Содержит вспомогательные методы для работы с JSON.
 * @author kadehar
 * @since 2.0.10
 */
public class JsonSlurper {
    private static final Logger LOG = LoggerFactory.getLogger(JsonSlurper.class);

    /**
     * Считывает summary.json в модель Summary
     * @param path путь к JSON файлу
     * @return итоговая информация из отчета
     */
    public static Summary readSummaryJson(final String path) {
        ObjectMapper mapper = new ObjectMapper();
        Summary summary = null;
        try {
            LOG.info("Reading json by path {}", path);
            summary = mapper.readValue(new File(path), Summary.class);
            LOG.info("Operation is finished successfully");
        } catch (IOException ex) {
            LOG.error("Error {} \n Reason {}", ex.getLocalizedMessage(), ex.getStackTrace());
            ex.printStackTrace();
            System.exit(1);
        }
        return summary;
    }

    public static String convertMapToJSON(Map<String, Object> map) {
        ObjectMapper mapper = new ObjectMapper();
        String json = "";
        try {
            LOG.info("Try to convert {} to JSON", map);
            json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(map);
            LOG.info("Operation is finished successfully");
        } catch (JsonProcessingException ex) {
            LOG.error("Error {} \n Reason {}", ex.getLocalizedMessage(), ex.getStackTrace());
            ex.printStackTrace();
            System.exit(1);
        }
        return json;
    }

    public static String prettyPrint(Object json) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
        } catch (JsonProcessingException e) {
            return  "";
        }
    }
}