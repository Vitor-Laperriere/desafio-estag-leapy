FROM node:20-alpine

WORKDIR /app

# Copia apenas o essencial primeiro para aproveitar cache
COPY package.json ./

# Não temos deps, mas mantemos o padrão
RUN npm install --omit=dev || true

# Copia o restante
COPY src ./src
COPY runner.yml ./runner.yml
# (Os testes não precisam ir para a imagem para execução da solução)

# Importante: manter STDIN aberto e saída no STDOUT
ENTRYPOINT ["node", "src/index.js"]
