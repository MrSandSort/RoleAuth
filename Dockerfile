FROM node:20-alpine

WORKDIR /app

# Install dependencies (build tools needed for bcrypt), then install production modules
COPY package*.json ./
RUN apk add --no-cache python3 make g++ \
  && npm ci --omit=dev

# Copy the rest of the app
COPY . .

EXPOSE 4000

CMD ["npm", "start"]
