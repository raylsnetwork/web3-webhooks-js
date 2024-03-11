<p align="center">
  <a href="" rel="noopener">
 <img src="https://i.postimg.cc/k4xPc7vh/parfinlog.jpg" alt="Project logo"></a>
</p>
<h3 align="center"></h3>

## Getting Started

Nosso explorador cross-chain para blockchains compatíveis com Ethereum web3. Ele foi desenvolvido utilizando a moderna pilha tecnológica web - TypeScript, Node, Nest, Prisma, Docker, Ethers e PostgreSQL.


> O projeto ainda está em desenvolvimento, como resultado, pode haver alterações significativas antes da versão 1.0.0.




### Instalação

Inicialmente, procederemos à preparação do ambiente.

```bash

npm install

# Preparar variável de ambiente
cp ./.env
```

#### Configuração do Prisma.

Pré-requisito: Instale o Prisma CLI globalmente com o comando npm install -g prisma.

Gerar código TypeScript relacionado ao esquema do Prisma utilizando o seguinte comando: 

```bash

npx prisma generate

```
Executa as migrações da base de dados para o ambiente de desenvolvimento.

```bash

npx prisma migrate dev

```
#### Variável de ambiente.

A seguir, configuraremos as variáveis de ambiente com exemplos para uma blockchain privada ou pública.

```bash
--- Exemplo blockchain privada ---

PORT= <port>
WSConnect="ws://<IP da rede>"
DATABASE_URL="postgresql://<usuario>:<senha>@<host>:<port>/<nome da base de dados>?schema=public"
```

```bash
--- Exemplo Infura ---

PORT=<port>

DATABASE_URL="https://mainnet.infura.io/v3/your_infura_project_id"

WSConnect="wss://mainnet.infura.io/ws/v3/your_infura_project_id"

--- Exemplo Alchemy ---

PORT= <port>

DATABASE_URL="https://polygon-mainnet.g.alchemy.com/v2/your_alchemy_api_key"

WSConnect="wss://polygon-mainnet.g.alchemy.com/v2/ws/your_alchemy_api_key"
```

#### Dar início à aplicação


```bash

npm start

```



