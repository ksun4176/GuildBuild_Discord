#Dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app
COPY package*.json ./

RUN npm install

#Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

#Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

CMD ["node", "dist/app.js"]