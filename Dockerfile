FROM node:12.20.1-alpine3.10 as build-stage
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install @elastic/apm-rum --save
COPY . .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT /
CMD ["nginx", "-g", "daemon off;"]

