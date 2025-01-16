# Этап сборки приложения
FROM node:18-alpine as build
LABEL authors="greem4"

ARG VITE_API_URL
ARG VITE_YANDEX_AUTH

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_YANDEX_AUTH=$VITE_YANDEX_AUTH

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап запуска через Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Используем простой конфиг без SSL
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
