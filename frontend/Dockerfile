FROM node:26.3-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
ARG VITE_ORS_HOST
ARG VITE_BACKEND_HOST
ENV VITE_ORS_HOST=$VITE_ORS_HOST
ENV VITE_BACKEND_HOST=$VITE_BACKEND_HOST
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
