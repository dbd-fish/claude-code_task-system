FROM node:18-alpine

# Install bash for development tools compatibility (Cursor IDE)
RUN apk add --no-cache bash

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]