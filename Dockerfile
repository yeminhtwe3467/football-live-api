FROM ghcr.io/puppeteer/puppeteer:24.4.0

RUN find / -name "chromium" -o -name "chrome" 2>/dev/null || echo "Chromium not found"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci 
COPY . .
CMD ["node", "index.js"]