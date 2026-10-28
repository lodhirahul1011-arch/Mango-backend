FROM node:24-bookworm-slim
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
RUN mkdir -p /app/data && chown node:node /app/data
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5000 DATABASE_PATH=/app/data/roomrent.sqlite
EXPOSE 5000
CMD ["node", "src/server.js"]
