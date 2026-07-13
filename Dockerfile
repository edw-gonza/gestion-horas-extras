FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copiar los archivos de Maven wrapper y asegurar permisos
COPY mvnw .
COPY .mvn .mvn

# Dar permisos de ejecución al wrapper
RUN chmod +x mvnw

COPY pom.xml .
COPY src src

# Ejecutar Maven con el wrapper
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]