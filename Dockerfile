FROM node:20-alpine


RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# COPY ./out/data ./out/data/_backup

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "npm", "start" ]