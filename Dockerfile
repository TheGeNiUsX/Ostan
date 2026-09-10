FROM node:20-alpine

WORKDIR /app

# Install git for dependency resolution if needed
RUN apk add --no-cache git python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY server/ ./server/

# Persistent directory for storing multi-user WhatsApp pairing sessions
RUN mkdir -p /app/whatsapp_sessions
VOLUME /app/whatsapp_sessions

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["node", "server/whatsapp-gateway.mjs"]
