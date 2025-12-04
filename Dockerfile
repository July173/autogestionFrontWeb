# Etapa 1: Build de la app
FROM node:18 AS build

# Crear directorio de la app
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código y construir la app
COPY . .
RUN npm run build

# Etapa 2: Servir la app con Nginx
FROM nginx:alpine

# Copiar el build de React al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html


# Exponer el puerto 80
EXPOSE 80

# Arrancar Nginx
CMD ["nginx", "-g", "daemon off;"]
