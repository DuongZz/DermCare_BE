FROM node:20-alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install --legacy-peer-deps && npm cache clean --force

COPY . .

RUN npm run build

EXPOSE 4000

CMD [ "npm", "start" ]