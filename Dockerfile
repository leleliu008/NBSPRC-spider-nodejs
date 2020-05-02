FROM node:11-alpine

MAINTAINER leleliu008@gmail.com

WORKDIR /root

ADD docker-entrypoint.sh .
ADD package.json .
ADD src src

RUN mkdir /data && \
    npm config set registry "https://registry.npm.taobao.org" && \
    npm install rxjs axios cheerio iconv-lite

ENTRYPOINT [ "./docker-entrypoint.sh" ]
