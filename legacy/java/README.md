# Java 5.0.* (legacy freeze)

Fat-jar line **5.0.8** — bug fix / security only. Product line **6.0.\*** is the TypeScript monorepo at the repo root.

```bash
cd legacy/java
./gradlew assemble
# jar → allure-notifications/build/libs/allure-notifications-5.0.8.jar
```

CI (master): [`.github/workflows/build.yml`](../../.github/workflows/build.yml) runs Gradle from this directory.
