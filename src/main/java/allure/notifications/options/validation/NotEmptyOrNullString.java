package allure.notifications.options.validation;

import com.beust.jcommander.IParameterValidator;
import com.beust.jcommander.ParameterException;

/**
 * Реализует валидацию строкового параметра, переданного через аргументы командной строки.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class NotEmptyOrNullString implements IParameterValidator {
    @Override
    public void validate(String name, String value) throws ParameterException {
        if (value.contains("null") || value.isEmpty()) {
            throw new ParameterException("Parameter " + name
                    + " should not be empty or null string (found " + value + ")");
        }
    }
}
