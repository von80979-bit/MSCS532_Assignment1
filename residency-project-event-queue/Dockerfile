# Reproducible run of the event-queue PoC demo.
FROM node:20-alpine

WORKDIR /app

# No third-party dependencies; all JavaScript (source, demo, tests) lives under src/.
COPY package.json ./
COPY src ./src
COPY ui ./ui

# The live UI server (npm run ui) listens here; irrelevant for the default demo/test commands.
EXPOSE 4173

# Default: run the demo driver. Override with `npm test` to run the test suite,
# or `npm run ui` (with -p 4173:4173) to serve the live visualization instead.
CMD ["node", "src/main.js"]
