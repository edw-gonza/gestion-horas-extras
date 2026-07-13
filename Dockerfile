FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copiar el pom.xml y descargar dependencias primero (mejor para caché)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests

# Imagen final más ligera
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el JAR (usa cualquier nombre que tenga .jar en target)
COPY --from=build /app/target/*.jar app.jar

# Puerto que usará la aplicación
EXPOSE 8080

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]