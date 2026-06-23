FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/signals ./signals
COPY --from=build /app/decisions ./decisions
COPY --from=build /app/assets ./assets
COPY --from=build /app/pilots ./pilots
COPY --from=build /app/reviews ./reviews
COPY --from=build /app/prompts ./prompts
COPY --from=build /app/planning ./planning

EXPOSE 3000

CMD ["npm", "start"]
