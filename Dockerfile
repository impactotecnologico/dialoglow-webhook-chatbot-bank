FROM node:8.9-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app-chatbot
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent
RUN mv node_modules ../
COPY . .
EXPOSE 8051
CMD node server.js