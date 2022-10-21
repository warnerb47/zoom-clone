FROM  node:16.15.0-alpine3.14

WORKDIR /app
COPY package*.json /app/
RUN npm i
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]
