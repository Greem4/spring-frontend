FROM node:18-alpine AS build

ARG VITE_API_URL
ARG VITE_YANDEX_AUTH

WORKDIR /app

RUN apk add --no-cache python3 make g++ && \
    npm install -g terser

COPY package*.json ./
RUN npm ci --no-audit --prefer-offline --no-fund && \
    npm cache clean --force

COPY . .
RUN npm run build && \
    find dist -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -exec gzip -k9 {} \; -exec brotli -k9 {} \;

FROM nginx:1.25-alpine
RUN apk add --no-cache brotli
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]