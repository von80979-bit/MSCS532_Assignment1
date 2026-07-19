# Reproducible run of the event-queue PoC demo.
FROM node:20-alpine

WORKDIR /app

# No third-party dependencies; all JavaScript (source, demo, tests) lives under src/.
COPY package.json ./
COPY src ./src

# Default: run the demo driver. Override with `npm test` to run the test suite.
CMD ["node", "src/main.js"]
