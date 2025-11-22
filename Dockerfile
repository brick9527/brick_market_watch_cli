FROM node:24.11.1-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["bin", "./bin"]
COPY ["src", "./src"]
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production --silent --registry=https://registry.npmmirror.com
COPY config.sample.json config.json
COPY notice.sample.json notice.json
COPY schedule.sample.json schedule.json
# COPY . .
# RUN chown -R node /usr/src/app
USER node
# CMD ["npm", "run", "schedule"]
