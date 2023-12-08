FROM --platform=linux/amd64 node:18.17.1

WORKDIR /usr/src/eagle-core/auth
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

RUN npm run build
RUN npm run keys

CMD [ "npm", "start" ]
