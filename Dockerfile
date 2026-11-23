# Reproducible test runner: same browsers locally and in any CI that can run containers.
#   docker build -t pw-framework .
#   docker run --rm -v "$PWD/playwright-report:/app/playwright-report" pw-framework
FROM node:22-bookworm-slim

WORKDIR /app
ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci

# Browsers and their OS-level dependencies are installed against the exact Playwright
# version in package-lock.json, so they can never drift apart.
RUN npx playwright install --with-deps chromium firefox webkit

COPY . .

CMD ["npx", "playwright", "test", "--reporter=html"]
