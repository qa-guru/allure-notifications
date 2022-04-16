package guru.qa.allure.notifications.mapper;

import guru.qa.allure.notifications.config.ApplicationConfig;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.util.ResourcesUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URISyntaxException;
import java.nio.file.Paths;

/**
 * @author kadehar
 * @since 4.0
 * Utility class for mapping legend *.json to Legend object.
 */
public class LegendMapper {
    private static final Logger LOG =
            LoggerFactory.getLogger(LegendMapper.class);

    public Legend map() {
        String lang = ApplicationConfig.newInstance()
                .readConfig().base().language() + ".json";
        String fullPath = new ResourcesUtil()
                .resourcesPath("/legend/" + lang);
        LOG.info("Mapping {} to Legend object", fullPath);
        return new JSON().parse(fullPath, Legend.class);
    }
}
