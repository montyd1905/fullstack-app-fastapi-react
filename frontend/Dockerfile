FROM node:18

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build
RUN yarn global add serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
