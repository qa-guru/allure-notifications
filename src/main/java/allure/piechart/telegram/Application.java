package allure.piechart.telegram;

import allure.piechart.telegram.options.CmdOptions;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;

import java.util.logging.Level;
import java.util.logging.Logger;

public class Application {
    private static final Logger LOGGER = Logger.getLogger(Application.class.getName());

    public static void main(String[] args) {
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
