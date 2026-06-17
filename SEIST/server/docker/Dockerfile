FROM node:20-alpine

WORKDIR /app
COPY dist/seis-static ./dist/seis-static
COPY server/node/static-server.mjs ./server/node/static-server.mjs

ENV HOST=0.0.0.0
ENV PORT=4177
ENV SEIS_STATIC_ROOT=/app/dist/seis-static

EXPOSE 4177
CMD ["node", "server/node/static-server.mjs"]

