FROM node:24.11.1-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["index.js", "index.js"]
COPY ["bin", "./bin"]
COPY ["src", "./src"]
COPY ignore_err.json ignore_err.json
COPY ignore_err_code.json ignore_err_code.json
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production --silent --registry=https://registry.npmmirror.com
COPY config.sample.json config.json
COPY notice.sample.json notice.json
COPY schedule.sample.json schedule.json
RUN mkdir -p logs/default \
  && chmod 755 logs/default \
  && chown -R node:node logs/default \
  && chmod 755 logs \
  && chown -R node:node logs
# COPY . .
# RUN chown -R node /usr/src/app
RUN chmod +x ./index.js
RUN npm link
USER node
CMD ["npm", "run", "start"]
