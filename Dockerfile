FROM node:20-alpine as build
LABEL authors="greem4"

ARG VITE_API_URL
ARG VITE_YANDEX_AUTH

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_YANDEX_AUTH=$VITE_YANDEX_AUTH
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

FROM nginx:stable-alpine
LABEL authors="greem4"

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
