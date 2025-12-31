FROM node:18-slim AS base
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/python/requirements.txt ./python-requirements.txt
RUN python3 -m venv /opt/venv && . /opt/venv/bin/activate && pip install --upgrade pip && pip install -r python-requirements.txt

FROM node:18-slim
RUN apt-get update && apt-get install -y python3 wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /opt/venv /opt/venv
COPY . .
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHON_PATH="/opt/venv/bin/python3"
EXPOSE 3001
CMD ["node", "src/index.js"]
