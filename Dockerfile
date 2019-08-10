FROM node:11-alpine
MAINTAINER leleliu008@gmail.com
WORKDIR /root
ADD docker-entrypoint.sh .
ADD package.json .
ADD src src
ADD node_modules node_modules
RUN mkdir /data
ENTRYPOINT [ "./docker-entrypoint.sh" ]
