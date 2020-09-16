FROM node:current-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production

COPY . .

CMD [ "node", "app.js" ]
