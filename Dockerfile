FROM node:18-alpine AS build

ARG VITE_API_URL
ARG VITE_YANDEX_AUTH

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --prefer-offline --no-fund && \
    npm cache clean --force

COPY . .
RUN npm run build && \
    find dist -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -exec gzip -k9 {} \; -exec brotli -k9 {} \;

FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/* && \
    apk add --no-cache brotli

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost || exit 1
USER nginx
CMD ["nginx", "-g", "daemon off;"]