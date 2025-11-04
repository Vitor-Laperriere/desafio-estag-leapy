FROM node:20-alpine

WORKDIR /app

# Copia apenas o essencial primeiro para aproveitar cache
COPY package.json ./


# Instala todas as dependências e cria um link global (/node_modules) para o harness montado em /tests
RUN npm install && ln -s /app/node_modules /node_modules


# Copia o restante
COPY src ./src
COPY runner.yml ./runner.yml


# Importante: manter STDIN aberto e saída no STDOUT
CMD ["node", "src/index.js"]
