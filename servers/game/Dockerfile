FROM node:10.13-alpine

WORKDIR /app
COPY . /app

ENV NODE_ENV production
RUN apk --no-cache add make python2 \
	&& npm install \
	&& apk del make python2

EXPOSE 80

CMD ["npm", "start"]
