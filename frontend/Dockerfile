# Frontend Dockerfile - React static build without Nginx
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG REACT_APP_API_URL=http://localhost:8001
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/

CMD ["serve", "-s", "build", "-l", "3000"]
