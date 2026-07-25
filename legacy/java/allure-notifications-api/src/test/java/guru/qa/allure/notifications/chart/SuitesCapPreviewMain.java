package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.report.ReportAnalytics;
import guru.qa.allure.notifications.report.SuiteStat;

/**
 * Local visual preview: Suites with one suite before/after row-height cap.
 * <pre>
 * ./gradlew :allure-notifications-api:test --tests '*.SuitesCapPreviewMain'
 * open allure-notifications-api/build/suites-cap-preview
 * </pre>
 */
class SuitesCapPreviewMain {

    private static final int TILE_W = 420;
    private static final int TILE_H = 240;
    private static final int HEADER = 36;
    private static final int MARGIN = 16;

    @Test
    void writeBeforeAfterPreview() throws Exception {
        Path moduleDir = Paths.get("").toAbsolutePath();
        if (!Files.isDirectory(moduleDir.resolve("src/test/resources/fixtures"))) {
            moduleDir = moduleDir.resolve("allure-notifications-api");
        }
        Path outDir = moduleDir.resolve("build/suites-cap-preview");
        Files.createDirectories(outDir);

        Base base = new Base();
        base.setProject("reference-app-tests");
        base.setDarkMode(true);

        ReportAnalytics analytics = new ReportAnalytics(
                new Statistic(),
                Collections.<String, Integer>emptyMap(),
                Collections.singletonList(new SuiteStat("chromium", 9)),
                Collections.<Long>emptyList(),
                false,
                9);
        Legend legend = new Legend();
        PanelContext ctx = PanelContext.of(base, TILE_W, TILE_H, analytics, legend, false);

        BufferedImage after = new SuitesPanel().render(ctx);
        BufferedImage before = renderUncapped(ctx);

        Path sheet = outDir.resolve("suites-single-before-after.png");
        ImageIO.write(compose(before, after), "png", sheet.toFile());
        ImageIO.write(cardWrap(before, "BEFORE · uncapped"), "png",
                outDir.resolve("suites-single-before.png").toFile());
        ImageIO.write(cardWrap(after, "AFTER · capped"), "png",
                outDir.resolve("suites-single-after.png").toFile());

        // Also copy into Cursor assets so the chat can Read the image.
        Path assets = Paths.get(System.getProperty("user.home"),
                ".cursor/projects/Users-stanislav-zero-design-system/assets");
        if (Files.isDirectory(assets)) {
            Files.copy(sheet, assets.resolve("suites-single-before-after.png"),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            Files.copy(outDir.resolve("suites-single-after.png"),
                    assets.resolve("suites-single-after.png"),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
        System.out.println("Wrote " + sheet.toAbsolutePath());
    }

    /** Old HorizontalBarRows math: row fills entire plot height. */
    private static BufferedImage renderUncapped(PanelContext context) {
        int width = context.getWidth();
        int height = context.getHeight();
        ChartTheme theme = context.getTheme();
        List<SuiteStat> suites = context.getAnalytics().getSuites();

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(theme.getBackground());
            g.fillRect(0, 0, width, height);

            int chartTop = PanelPlotArea.chartTop(false);
            int plotH = PanelPlotArea.chartHeight(height, false);
            int rowHeight = Math.max(14, plotH);
            int barHeight = Math.max(4, (int) Math.round(rowHeight * 0.52));
            int fontSize = Math.max(9, Math.min(13, rowHeight - 5));

            int chartWidth = width - (MARGIN * 2);
            int labelWidth = Math.min(180, chartWidth / 3);
            int barAreaWidth = chartWidth - labelWidth - 40;

            g.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, fontSize));
            FontMetrics metrics = g.getFontMetrics();
            SuiteStat suite = suites.get(0);
            int baseline = chartTop + (rowHeight + metrics.getAscent() - metrics.getDescent()) / 2;
            int barTop = chartTop + (rowHeight - barHeight) / 2;

            g.setColor(theme.getText());
            g.drawString(suite.getName(), MARGIN, baseline);

            int barWidth = barAreaWidth;
            int barX = MARGIN + labelWidth;
            g.setColor(theme.getAccent());
            Bars.fillPill(g, barX, barTop, Math.max(barWidth, 2), barHeight);

            g.setColor(theme.getText());
            g.drawString(String.valueOf(suite.getCount()), barX + barWidth + 6, baseline);
        } finally {
            g.dispose();
        }
        return image;
    }

    private static BufferedImage cardWrap(BufferedImage body, String title) {
        int w = body.getWidth();
        int h = body.getHeight() + HEADER;
        BufferedImage card = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = card.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(new Color(40, 40, 40));
            g.fillRect(0, 0, w, HEADER);
            g.setColor(new Color(220, 220, 220));
            g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 13));
            g.drawString(title, 14, 24);
            g.drawImage(body, 0, HEADER, null);
        } finally {
            g.dispose();
        }
        return card;
    }

    private static BufferedImage compose(BufferedImage before, BufferedImage after) {
        BufferedImage left = cardWrap(before, "BEFORE · uncapped (сейчас в боте)");
        BufferedImage right = cardWrap(after, "AFTER · capped ≤18px bar");
        int gap = 24;
        int w = left.getWidth() + gap + right.getWidth();
        int h = Math.max(left.getHeight(), right.getHeight()) + 48;
        BufferedImage sheet = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = sheet.createGraphics();
        try {
            g.setColor(new Color(28, 28, 28));
            g.fillRect(0, 0, w, h);
            g.setColor(new Color(200, 200, 200));
            g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 16));
            g.drawString("Suites · 1 suite (chromium = 9)", 16, 30);
            g.drawImage(left, 0, 48, null);
            g.drawImage(right, left.getWidth() + gap, 48, null);
        } finally {
            g.dispose();
        }
        return sheet;
    }
}
