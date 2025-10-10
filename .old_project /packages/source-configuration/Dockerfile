FROM nginx:stable-alpine

RUN mkdir /app
COPY ./dist /app
#Copy default nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
