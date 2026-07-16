package guru.qa.allure.notifications.chart;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.awt.Color;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

class PyramidLayerColorsTest {

    private static final List<String> CANON_ORDER = Arrays.asList(
            "unit", "component", "integration", "api", "e2e", "manual"
    );

    @Test
    void orderedLayersMatchMonorepoPyramidLayers() {
        assertEquals(CANON_ORDER, PyramidLayerColors.orderedLayers());
    }

    @Test
    void paletteADarkColors() {
        assertColor("#60d87a", PyramidLayerColors.colorFor("unit", true));
        assertColor("#ffa833", PyramidLayerColors.colorFor("component", true));
        assertColor("#dd7edd", PyramidLayerColors.colorFor("integration", true));
        assertColor("#ffe04a", PyramidLayerColors.colorFor("api", true));
        assertColor("#ff6f67", PyramidLayerColors.colorFor("e2e", true));
        assertColor("#61b6fb", PyramidLayerColors.colorFor("manual", true));
    }

    @Test
    void paletteALightColors() {
        assertColor("#3bc95d", PyramidLayerColors.colorFor("unit", false));
        assertColor("#ff8200", PyramidLayerColors.colorFor("component", false));
        assertColor("#c165c1", PyramidLayerColors.colorFor("integration", false));
        assertColor("#ffd833", PyramidLayerColors.colorFor("api", false));
        assertColor("#f43f3b", PyramidLayerColors.colorFor("e2e", false));
        assertColor("#459bde", PyramidLayerColors.colorFor("manual", false));
    }

    @Test
    void layerLookupIsCaseInsensitive() {
        assertEquals(PyramidLayerColors.colorFor("e2e", true), PyramidLayerColors.colorFor("E2E", true));
    }

    @Test
    void unknownLayerReturnsNull() {
        assertNull(PyramidLayerColors.colorFor("visual", true));
        assertNull(PyramidLayerColors.colorFor(null, false));
        assertFalse(PyramidLayerColors.isKnownLayer("visual"));
        assertTrue(PyramidLayerColors.isKnownLayer("api"));
        assertEquals(Color.decode("#64748b"), PyramidLayerColors.colorForOther(false));
        assertEquals(Color.decode("#94a3b8"), PyramidLayerColors.colorForOther(true));
        assertEquals("other", PyramidLayerColors.OTHER_LAYER);
    }

    private static void assertColor(String hex, Color actual) {
        Color expected = Color.decode(hex);
        assertEquals(expected.getRed(), actual.getRed());
        assertEquals(expected.getGreen(), actual.getGreen());
        assertEquals(expected.getBlue(), actual.getBlue());
    }
}
