package allure.piechart.telegram;

import allure.piechart.telegram.options.CmdOptions;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;

import java.util.logging.Level;
import java.util.logging.Logger;

public class Application {
    private static final Logger LOGGER = Logger.getLogger(Application.class.getName());

    public static void main(String[] args) {
        /*
          String chatId = "0";                                    // for debug
          String secretBot = "0";                                        // telegram secret for bot
          String projectName = "Project name";                    // for debug
          String allureReportFolder = "allure-report/";     // for debug
          String buildLink = "http://google.com/";              // for debug
          String launchName = "123";                           // for debug
          String someUrl = "1234";                           // for debug
         */
        LOGGER.info("Start application");
        CmdOptions options = new CmdOptions();
        CmdLineParser parser = new CmdLineParser(options);

        try {
            parser.parseArgument(args);
            options.run();
        } catch (CmdLineException e) {
            LOGGER.log(Level.INFO, e.getMessage(), e.getStackTrace());
            e.printStackTrace();
        }
        LOGGER.info("Stop application");
    }
}
