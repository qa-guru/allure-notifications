/**
 * TS mirror of jar SSOT: legacy/java/allure-notifications-api/src/main/resources/phrases/*.json
 */

export type PhrasePack = {
  results: string;
  environment: string;
  comment: string;
  links: {
    report: string;
    dashboard: string;
    testops: string;
    build: string;
  };
  scenario: {
    duration: string;
    totalScenarios: string;
    totalPassed: string;
    totalFailed: string;
    totalBroken: string;
    totalUnknown: string;
    totalSkipped: string;
  };
};

/** Flat shape for Telegram caption builders (CLI + builder preview). */
export type CaptionPhrases = {
  results: string;
  environment: string;
  comment: string;
  duration: string;
  totalScenarios: string;
  totalPassed: string;
  totalFailed: string;
  totalBroken: string;
  totalUnknown: string;
  totalSkipped: string;
  links: PhrasePack["links"];
};

export const PHRASES = Object.freeze({
  en: {
    results: "Results",
    environment: "Environment",
    comment: "Comment",
    links: {
      report: "Report",
      dashboard: "Dashboard",
      testops: "TestOps",
      build: "Build",
    },
    scenario: {
      duration: "Duration",
      totalScenarios: "Total scenarios",
      totalPassed: "Total passed",
      totalFailed: "Total failed",
      totalBroken: "Total broken",
      totalUnknown: "Total unknown",
      totalSkipped: "Total skipped",
    },
  },
  de: {
    results: "Ergebnisse",
    environment: "Umgebung",
    comment: "Kommentar",
    links: {
      report: "Bericht",
      dashboard: "Dashboard",
      testops: "TestOps",
      build: "Build",
    },
    scenario: {
      duration: "Dauer",
      totalScenarios: "Szenarien gesamt",
      totalPassed: "Gesamt bestanden",
      totalFailed: "Gesamt fehlgeschlagen",
      totalBroken: "Gesamt defekt",
      totalUnknown: "Gesamt unbekannt",
      totalSkipped: "Gesamt übersprungen",
    },
  },
  fr: {
    results: "Résultats",
    environment: "Environnement",
    comment: "Commentaire",
    links: {
      report: "Rapport",
      dashboard: "Tableau de bord",
      testops: "TestOps",
      build: "Build",
    },
    scenario: {
      duration: "Durée",
      totalScenarios: "Scénarios totaux",
      totalPassed: "Total passé",
      totalFailed: "Total a échoué",
      totalBroken: "Total cassé",
      totalUnknown: "Total inconnu",
      totalSkipped: "Total ignoré",
    },
  },
  ru: {
    results: "Результаты",
    environment: "Рабочее окружение",
    comment: "Комментарий",
    links: {
      report: "Отчёт",
      dashboard: "Дашборд",
      testops: "TestOps",
      build: "Сборка",
    },
    scenario: {
      duration: "Продолжительность",
      totalScenarios: "Всего сценариев",
      totalPassed: "Всего успешных тестов",
      totalFailed: "Всего упавших тестов",
      totalBroken: "Всего сломанных тестов",
      totalUnknown: "Всего неизвестных тестов",
      totalSkipped: "Всего пропущенных тестов",
    },
  },
  by: {
    results: "Вынікі",
    environment: "Працоўнае асяроддзе",
    comment: "Каментар",
    links: {
      report: "Справаздача",
      dashboard: "Дашборд",
      testops: "TestOps",
      build: "Зборка",
    },
    scenario: {
      duration: "Працягласць",
      totalScenarios: "Усяго сцэнарыяў",
      totalPassed: "Усяго паспяховых тэстаў",
      totalFailed: "Усяго тэстаў, якія ўпалі",
      totalBroken: "Усяго зламаных тэстаў",
      totalUnknown: "Усяго невядомых тэстаў",
      totalSkipped: "Усяго прапушчаных тэстаў",
    },
  },
  ua: {
    results: "Результати",
    environment: "Середовище",
    comment: "Коментар",
    links: {
      report: "Звіт",
      dashboard: "Дашборд",
      testops: "TestOps",
      build: "Збірка",
    },
    scenario: {
      duration: "Тривалість",
      totalScenarios: "Усього сценаріїв",
      totalPassed: "Усього успішних тестів",
      totalFailed: "Усього невдалих тестів",
      totalBroken: "Усього зламаних тестів",
      totalUnknown: "Усього невідомих тестів",
      totalSkipped: "Всього пропущених тестів",
    },
  },
  cn: {
    results: "测试结果",
    environment: "环境",
    comment: "评论",
    links: {
      report: "报告",
      dashboard: "仪表盘",
      testops: "TestOps",
      build: "构建",
    },
    scenario: {
      duration: "持续时间",
      totalScenarios: "脚本总数",
      totalPassed: "通过总数",
      totalFailed: "失败总数",
      totalBroken: "损坏总数",
      totalUnknown: "未知错误总数",
      totalSkipped: "跳过总数",
    },
  },
  cnt: {
    results: "測試結果",
    environment: "環境",
    comment: "评论",
    links: {
      report: "報告",
      dashboard: "儀表盤",
      testops: "TestOps",
      build: "構建",
    },
    scenario: {
      duration: "持續時間",
      totalScenarios: "腳本總數",
      totalPassed: "通過總數",
      totalFailed: "失敗總數",
      totalBroken: "損壞總數",
      totalUnknown: "未知錯誤總數",
      totalSkipped: "跳過總數",
    },
  },
  morse: {
    results: ".-. . ... ..- .-.. - ...",
    environment: ". -. ...- .. .-. --- -. -- . -. -",
    comment: "-.-. --- -- -- . -. -",
    links: {
      report: ".-. . .--. --- .-. -",
      dashboard: "-.. .- ... .... -... --- .- .-. -..",
      testops: "- . ... - --- .--. ...",
      build: "-... ..- .. .-.. -..",
    },
    scenario: {
      duration: "-.. ..- .-. .- - .. --- -.",
      totalScenarios: "- --- - .- .-.. / ... -.-. . -. .- .-. .. --- ...",
      totalPassed: "- --- - .- .-.. / .--. .- ... ... . -..",
      totalFailed: "- --- - .- .-.. / ..-. .- .. .-.. . -..",
      totalBroken: "- --- - .- .-.. / -... .-. --- -.- . -.",
      totalUnknown: "- --- - .- .-.. / ..- -. -.- -. --- .-- -.",
      totalSkipped: "- --- - .- .-.. / ... -.- .. .--. .--. . -..",
    },
  },
} satisfies Record<string, PhrasePack>);

export type PhraseLanguage = keyof typeof PHRASES;

export function resolvePhraseLanguage(
  language: string | undefined,
): PhraseLanguage {
  const key = (language ?? "en").toLowerCase();
  return key in PHRASES ? (key as PhraseLanguage) : "en";
}

export function phrasesFor(language: string | undefined): PhrasePack {
  return PHRASES[resolvePhraseLanguage(language)];
}

export function captionPhrasesFor(
  language: string | undefined,
): CaptionPhrases {
  const pack = phrasesFor(language);
  return {
    results: pack.results,
    environment: pack.environment,
    comment: pack.comment,
    duration: pack.scenario.duration,
    totalScenarios: pack.scenario.totalScenarios,
    totalPassed: pack.scenario.totalPassed,
    totalFailed: pack.scenario.totalFailed,
    totalBroken: pack.scenario.totalBroken,
    totalUnknown: pack.scenario.totalUnknown,
    totalSkipped: pack.scenario.totalSkipped,
    links: pack.links,
  };
}
