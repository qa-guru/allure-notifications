# Java 5.0.* (legacy freeze)

Fat-jar line **5.0.8** — bug fix / security only. Product line **6.0.\*** is the TypeScript monorepo at the repo root.

```bash
cd legacy/java
./gradlew assemble
# jar → allure-notifications/build/libs/allure-notifications-5.0.8.jar
```

CI (master): [`.github/workflows/build.yml`](../../.github/workflows/build.yml) runs Gradle from this directory.

## Opt-in jar dogfood (not 6.x gate)

Builder active tests = unit + Playwright. Jar PNG check lives here only:

```bash
# from repo root; needs assemble + build/pyramid-showcase fixtures
python legacy/java/dogfood_jar.py
# fail if jar/fixtures missing:
ANB_DOGFOOD_REQUIRED=1 python legacy/java/dogfood_jar.py
```

Chrome knobs match builder defaults (`headerHeight` **31**). Do not wire this into `apps/builder` `pnpm test`.
