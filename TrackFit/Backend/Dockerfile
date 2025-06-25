# Starten Sie mit einem Basisimage, das Java enthält
FROM openjdk:17-jdk-alpine

# Variable zum Einfügen des Jar
ARG JAR_FILE=target/sep_backend.jar

# Kopieren Sie die Jar-Datei in das Docker-Image
COPY ${JAR_FILE} app.jar

# Führen Sie die Anwendung aus
ENTRYPOINT ["java","-jar","/app.jar"]

