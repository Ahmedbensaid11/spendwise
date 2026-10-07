FROM maven:3.9.16-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre

WORKDIR /app
RUN groupadd --system spendwise && useradd --system --gid spendwise --home-dir /app spendwise
COPY --from=build --chown=spendwise:spendwise /workspace/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar
USER spendwise

EXPOSE 9090
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
