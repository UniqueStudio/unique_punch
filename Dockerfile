FROM node

WORKDIR /usr/src/app
COPY . .

COPY /src/assets /usr/share/fonts
RUN fc-cache -f -v

RUN yarn
ENTRYPOINT ["yarn", "ts-node", "./src/index.ts"]
CMD ["{{Date Range}}"]