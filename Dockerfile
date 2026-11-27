FROM node:22.23.2-bookworm-slim@sha256:48e4b67d85f87bd551df43704e24d252f56cc5f8e9718841aace50f19948f0f9 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --global npm@10.9.8 && npm ci
COPY . .
ARG API_ORIGIN
RUN API_ORIGIN="$API_ORIGIN" node scripts/configure-cloud-build.mjs \
    && npm run build -- --configuration production,cloud

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/eyes-project-front/browser/ /usr/share/nginx/html/
EXPOSE 8080
