# Stage 1: Сборка приложения
FROM node:18-alpine as builder

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm install

# Копируем исходный код приложения
COPY . .

# Собираем приложение (предполагается, что команда "build" настроена в package.json)
RUN npm run build

# Stage 2: Запуск приложения через nginx
FROM nginx:alpine

# Очищаем стандартную директорию nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранные файлы из стадии builder в директорию для статики nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]
