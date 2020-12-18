package allure.piechart.telegram;

import allure.piechart.telegram.clients.BaseClient;
import allure.piechart.telegram.options.CmdOptions;
import allure.piechart.telegram.options.OptionsValues;
import com.beust.jcommander.JCommander;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Application {
    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        LOGGER.info("Start application");
        CmdOptions options = new CmdOptions();
        JCommander.newBuilder()
                .addObject(options)
                .build()
                .parse(args); // replace args by Utils.debugArgs() for debug
        OptionsValues values = options.collectOptions();
        BaseClient.sendMessage(values);
        LOGGER.info("Stop application");
    }
}
