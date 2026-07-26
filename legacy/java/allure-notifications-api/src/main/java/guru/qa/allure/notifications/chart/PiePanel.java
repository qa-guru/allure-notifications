package guru.qa.allure.notifications.chart;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.geom.Arc2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.imageio.ImageIO;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;
import lombok.extern.slf4j.Slf4j;

/**
 * Donut chart rendered with Java2D.
 *
 * <p>Shows the pass-rate percentage and total test count in the center, with
 * status segments (passed / failed / broken / skipped / unknown) drawn as a
 * ring of rounded arcs separated by small gaps.
 */
@Slf4j
public class PiePanel implements ChartPanel {
    public static final String ID = "pie";

    // Ring geometry as a fraction of the panel's shorter side.
    private static final double RING_STROKE_RATIO = 0.085;
    private static final double RING_MARGIN_RATIO = 0.14;
    private static final double PCT_FONT_RATIO = 0.15;
    private static final double SUB_FONT_RATIO = 0.06;
    // Visual gap between neighbouring segments, in degrees.
    private static final double SEGMENT_GAP_DEGREES = 3.0;

    @Override
    public String getId() {
        return ID;
    }

    public static byte[] createChart(Base base, Statistic statistic, Legend legend) throws MessageBuildException {
        PanelContext context = PanelContext.of(
                base,
                500,
                500,
                ReportAnalyticsFactory.fromStatistic(statistic),
                legend);
        return ChartImageEncoder.toPngBytes(new PiePanel().render(context));
    }

    @Override
    public BufferedImage render(PanelContext context) throws MessageBuildException {
        Base base = context.getBase();
        ChartTheme theme = context.getTheme();
        Statistic statistic = context.getAnalytics().getStatistic();
        if (statistic == null) {
            throw new MessageBuildException("Statistic is required for pie panel", null);
        }

        int width = context.getWidth();
        int height = context.getHeight();
        log.info("Creating pie panel {}x{}...", width, height);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL,
                    RenderingHints.VALUE_STROKE_PURE);

            graphics.setColor(theme.getBackground());
            graphics.fillRect(0, 0, width, height);

            drawDonut(graphics, width, height, statistic, theme);
        } finally {
            graphics.dispose();
        }

        addLogo(base, image, width, height);
        log.info("Pie panel is created.");
        return image;
    }

    private void drawDonut(Graphics2D graphics, int width, int height, Statistic statistic, ChartTheme theme) {
        List<Segment> segments = buildSegments(statistic);
        long segmentSum = 0;
        for (Segment segment : segments) {
            segmentSum += segment.value;
        }
        int total = statistic.getTotal() != null ? statistic.getTotal() : (int) segmentSum;
        int passed = statistic.getPassed() != null ? statistic.getPassed() : 0;

        double side = Math.min(width, height);
        double stroke = side * RING_STROKE_RATIO;
        double diameter = side - side * RING_MARGIN_RATIO - stroke;
        double centerX = width / 2.0;
        double centerY = height / 2.0;
        double arcX = centerX - diameter / 2.0;
        double arcY = centerY - diameter / 2.0;

        graphics.setStroke(new BasicStroke((float) stroke, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

        if (segmentSum <= 0) {
            graphics.setColor(emptyRing(theme));
            graphics.draw(new Arc2D.Double(arcX, arcY, diameter, diameter, 0, 360, Arc2D.OPEN));
        } else if (segments.size() == 1) {
            graphics.setColor(segments.get(0).color);
            graphics.draw(new Arc2D.Double(arcX, arcY, diameter, diameter, 0, 360, Arc2D.OPEN));
        } else {
            // A round cap adds ~capAngle of arc at each end of a segment, so a slice can never
            // be painted shorter than a single round dot (2 * capAngle). Reserve room for the
            // gap and both caps; tiny slices that fall below that are bumped up to a minimum
            // slot, and the deficit is taken from the largest slice so the total stays 360.
            double radius = diameter / 2.0;
            double capAngle = Math.toDegrees(stroke / 2.0 / radius);
            double minSlot = SEGMENT_GAP_DEGREES + 2.0 * capAngle;

            double[] slots = new double[segments.size()];
            int largest = 0;
            double deficit = 0.0;
            for (int i = 0; i < segments.size(); i++) {
                slots[i] = (double) segments.get(i).value / segmentSum * 360.0;
                if (slots[i] > slots[largest]) {
                    largest = i;
                }
            }
            for (int i = 0; i < slots.length; i++) {
                if (i != largest && slots[i] < minSlot) {
                    deficit += minSlot - slots[i];
                    slots[i] = minSlot;
                }
            }
            slots[largest] = Math.max(slots[largest] - deficit, minSlot);

            double angle = 90.0; // start at the top, sweep clockwise
            for (int i = 0; i < segments.size(); i++) {
                double footprint = slots[i] - SEGMENT_GAP_DEGREES;
                double sweep = Math.max(footprint - 2.0 * capAngle, 0.01);
                double start = angle - (SEGMENT_GAP_DEGREES / 2.0 + capAngle);
                graphics.setColor(segments.get(i).color);
                graphics.draw(new Arc2D.Double(arcX, arcY, diameter, diameter, start, -sweep, Arc2D.OPEN));
                angle -= slots[i];
            }
        }

        drawCenterText(graphics, centerX, centerY, side, passed, total, theme);
    }

    private void drawCenterText(Graphics2D graphics, double centerX, double centerY, double side,
                                int passed, int total, ChartTheme theme) {
        double percentage = total > 0 ? (double) passed / total * 100.0 : 0.0;
        String percentageText = String.format(Locale.US, "%.2f%%", percentage);
        String subText = "of " + total;

        Font percentageFont = new Font(Font.SANS_SERIF, Font.BOLD, (int) Math.round(side * PCT_FONT_RATIO));
        Font subFont = new Font(Font.SANS_SERIF, Font.PLAIN, (int) Math.round(side * SUB_FONT_RATIO));

        graphics.setFont(percentageFont);
        FontMetrics percentageMetrics = graphics.getFontMetrics();
        int percentageWidth = percentageMetrics.stringWidth(percentageText);
        int percentageAscent = percentageMetrics.getAscent();

        graphics.setFont(subFont);
        FontMetrics subMetrics = graphics.getFontMetrics();
        int subWidth = subMetrics.stringWidth(subText);
        int subAscent = subMetrics.getAscent();

        double lineGap = side * 0.02;
        double blockHeight = percentageAscent + lineGap + subAscent;
        double top = centerY - blockHeight / 2.0;

        graphics.setFont(percentageFont);
        graphics.setColor(headlineText(theme));
        graphics.drawString(percentageText,
                (float) (centerX - percentageWidth / 2.0),
                (float) (top + percentageAscent));

        graphics.setFont(subFont);
        graphics.setColor(mutedText(theme));
        graphics.drawString(subText,
                (float) (centerX - subWidth / 2.0),
                (float) (top + percentageAscent + lineGap + subAscent));
    }

    private List<Segment> buildSegments(Statistic statistic) {
        List<Segment> segments = new ArrayList<>();
        addSegment(segments, statistic.getPassed(), ChartTheme.STATUS_PASSED);
        addSegment(segments, statistic.getFailed(), ChartTheme.STATUS_FAILED);
        addSegment(segments, statistic.getBroken(), ChartTheme.STATUS_BROKEN);
        addSegment(segments, statistic.getSkipped(), ChartTheme.STATUS_SKIPPED);
        addSegment(segments, statistic.getUnknown(), ChartTheme.STATUS_UNKNOWN);
        return segments;
    }

    private void addSegment(List<Segment> segments, Integer value, Color color) {
        if (value != null && value > 0) {
            segments.add(new Segment(value, color));
        }
    }

    private static Color headlineText(ChartTheme theme) {
        return theme.isDark() ? new Color(236, 239, 244) : new Color(46, 52, 64);
    }

    private static Color mutedText(ChartTheme theme) {
        return theme.isDark() ? new Color(150, 150, 150) : new Color(138, 148, 166);
    }

    private static Color emptyRing(ChartTheme theme) {
        return theme.isDark() ? new Color(80, 80, 80) : new Color(224, 226, 230);
    }

    private static void addLogo(Base base, BufferedImage chartImage, int width, int height) {
        String logo = base.getLogo();
        if (logo == null) {
            return;
        }
        try {
            BufferedImage originalLogo = ImageIO.read(new File(logo));
            Image scaledLogo = LogoScaler.scaleLogo(originalLogo, width, height);
            chartImage.getGraphics().drawImage(scaledLogo, 3, 3, null);
        } catch (IOException e) {
            log.warn("Logo file does not exist: {}", logo);
        }
    }

    private static final class Segment {
        private final int value;
        private final Color color;

        private Segment(int value, Color color) {
            this.value = value;
            this.color = color;
        }
    }
}
