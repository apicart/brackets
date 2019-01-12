FROM nginx:alpine

RUN apk add --no-cache yarn

RUN node -v && yarn -v
