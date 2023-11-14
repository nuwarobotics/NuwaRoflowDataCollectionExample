FROM node:12-alpine

# for ubuntu
RUN sed -i 's/https/http/' /etc/apk/repositories
RUN apk add curl

ENV WORK_DIR /usr/app
ENV EXEC_ENV dev
WORKDIR ${WORK_DIR}

COPY package.json ${WORK_DIR}

RUN apk update && \
    apk add git make g++ openssh-client && \
    rm -rf /var/cache/apk/* && \
    npm install pm2 -g

RUN npm install --only=production

COPY ./src ${WORK_DIR}/src
COPY ./pm2 ${WORK_DIR}/pm2
