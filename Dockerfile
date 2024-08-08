FROM node:20.6.0 as build-stage

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]

FROM node:20.6.0-alpine as production-stage

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm install --only=production

COPY --from=build-stage /app/dist ./dist

CMD [ "npm", "start" ]
