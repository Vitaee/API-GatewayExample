FROM node:22-alpine

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production

COPY index.js .

EXPOSE 3000
CMD ["node", "index.js"]
