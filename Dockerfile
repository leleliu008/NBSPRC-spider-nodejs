FROM node:11-alpine
MAINTAINER leleliu008@gmail.com
WORKDIR /root
VOLUME /root/output.json
ADD package.json .
ADD src src
ADD node_modules node_modules
CMD [ "npm", "start" ]
