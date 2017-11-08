FROM node:6
EXPOSE 8080

RUN mkdir /usr/bigzam
WORKDIR /usr/bigzam
COPY . /usr/bigzam

RUN npm install
CMD ["node", "server.js"]