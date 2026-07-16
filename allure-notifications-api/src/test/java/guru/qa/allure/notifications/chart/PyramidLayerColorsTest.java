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
        assertColor("#64748b", PyramidLayerColors.colorFor("unit", true));
        assertColor("#3b82f6", PyramidLayerColors.colorFor("component", true));
        assertColor("#06b6d4", PyramidLayerColors.colorFor("integration", true));
        assertColor("#8b5cf6", PyramidLayerColors.colorFor("api", true));
        assertColor("#f59e0b", PyramidLayerColors.colorFor("e2e", true));
        assertColor("#f97316", PyramidLayerColors.colorFor("manual", true));
    }

    @Test
    void paletteALightColors() {
        assertColor("#94a3b8", PyramidLayerColors.colorFor("unit", false));
        assertColor("#2563eb", PyramidLayerColors.colorFor("component", false));
        assertColor("#0891b2", PyramidLayerColors.colorFor("integration", false));
        assertColor("#7c3aed", PyramidLayerColors.colorFor("api", false));
        assertColor("#d97706", PyramidLayerColors.colorFor("e2e", false));
        assertColor("#ea580c", PyramidLayerColors.colorFor("manual", false));
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
