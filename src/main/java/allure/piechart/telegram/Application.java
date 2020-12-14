package allure.piechart.telegram;

import allure.piechart.telegram.options.CmdOptions;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Application {
    private static final Logger LOGGER = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args) {
        LOGGER.info("Start application");
        CmdOptions options = new CmdOptions();
        CmdLineParser parser = new CmdLineParser(options);

        try {
            parser.parseArgument(args); //for debugging replace args -> Utils.debugArgs()
            options.run();
        } catch (CmdLineException e) {
            LOGGER.error("Error {} \n Reason {}", e.getLocalizedMessage(), e.getStackTrace());
            e.printStackTrace();
            System.exit(1);
        }
        LOGGER.info("Stop application");
    }
}
