package guru.qa.allure.notifications.chart;

import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

import guru.qa.allure.notifications.exceptions.MessageBuildException;

/**
 * Placeholder body for catalog panels that have no analytics series yet.
 * Keeps free-grid tiles visible (no silent drop) with a centred empty-state caption.
 */
public final class EmptyStatePanel implements ChartPanel {
    public static final String ID = "emptystate";
    private static final int MARGIN = 16;
    private static final String DEFAULT_MESSAGE = "No data";

    private final String message;

    public EmptyStatePanel() {
        this(DEFAULT_MESSAGE);
    }

    public EmptyStatePanel(String message) {
        this.message = message == null || message.isEmpty() ? DEFAULT_MESSAGE : message;
    }

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        return renderEmpty(context, message);
    }

    /**
     * Draws a themed empty tile with {@code message} centred in the body.
     */
    public static BufferedImage renderEmpty(PanelContext context, String message)
            throws MessageBuildException {
        ChartTheme theme = context.getTheme();
        int width = Math.max(1, context.getWidth());
        int height = Math.max(1, context.getHeight());
        String caption = message == null || message.isEmpty() ? DEFAULT_MESSAGE : message;

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(theme.getBackground());
            graphics.fillRect(0, 0, width, height);
            graphics.setColor(theme.getText());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
            int textWidth = graphics.getFontMetrics().stringWidth(caption);
            int x = Math.max(MARGIN, (width - textWidth) / 2);
            int y = Math.max(MARGIN + 12, height / 2);
            graphics.drawString(caption, x, y);
        } finally {
            graphics.dispose();
        }
        return image;
    }
}
