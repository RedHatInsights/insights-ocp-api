FROM node:6
EXPOSE 8080

RUN mkdir /opt/insights-ocp-api
WORKDIR /opt/insights-ocp-api
COPY . /opt/insights-ocp-api

RUN npm install
RUN npm prune --production

CMD ["node", "server.js"]
