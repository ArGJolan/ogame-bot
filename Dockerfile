FROM node:16

ENV NODE_ENV=prod

RUN mkdir -p /app
WORKDIR /app
COPY ./package.json /app
RUN npm install --production

COPY . /app

CMD ["sh", "-c", "node index.js"]
