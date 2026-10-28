FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node backend-integration ./backend-integration
USER node
ENV NODE_ENV=production PORT=5000 TRUST_PROXY_HOPS=1
EXPOSE 5000
CMD ["npm", "start"]
