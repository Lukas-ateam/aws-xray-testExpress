FROM node:14.17.6

RUN mkdir -p /app
WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]