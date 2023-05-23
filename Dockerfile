FROM docker.indianic.com/library/node:16.17.1
WORKDIR /app
#ENV NODE_TLS_REJECT_UNAUTHORIZED='0'
COPY package.json .
RUN npm install
COPY . .
EXPOSE 4000
CMD node server.js
