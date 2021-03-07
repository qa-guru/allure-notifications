package allure.piechart.telegram.languages;

import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        "system:properties",
        "classpath:languages/en.properties"
//        "classpath:languages/" + getLanguage() + ".properties" todo
})
public interface Language extends Config {

}
