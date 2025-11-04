FROM node:20-alpine

WORKDIR /app

# Copia apenas o essencial primeiro para aproveitar cache
COPY package.json ./

# Instala todas as dependências (inclui dev para o harness dos testes)
RUN npm install

# Copia o restante
COPY src ./src
COPY runner.yml ./runner.yml


# Importante: manter STDIN aberto e saída no STDOUT
CMD ["node", "src/index.js"]
