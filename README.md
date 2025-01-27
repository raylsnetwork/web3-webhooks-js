<p align="center">
  <a href="" rel="noopener">
 <img src="https://i.postimg.cc/k4xPc7vh/parfinlog.jpg" alt="Project logo"></a>
</p>
<h3 align="center"></h3>

## Getting Started

Nosso Webhook cross-chain para blockchains compatíveis com Ethereum web3. Ele foi desenvolvido utilizando a moderna pilha tecnológica web - TypeScript, Node, Nest, Prisma, Docker, Ethers e PostgreSQL.


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

#### Criar uma subscrição

Realizar post para /subscribe com o body
```bash

{
  "hostDest": "string",
  "address": "string",
  "event": "string"
}

```
Onde:
- hostDest - url que irá receber o retorno do webhook
- address - Endereço web3 do contrato a ser monitorado
- event [opcional] - Preencher caso queira monitorar apenas um evento específico do contrato

Exemplo de body
```bash

{
    "hostDest":"http://my.example.app/webhook",
    "address":"0xcc16bff9b3f446e0730e2c94b28a68a743ddd904",
    "event":"Transfer(address,address,uint256)"
}

```
#### Conteúdo de retorno do webhook

Quando o monitoramento do webhook identificar uma transação que está dentro das regras de uma subscrição, ele enviará os dados da transação web3 à url inscrita. Ele irá chamar a url inscrita (informada no campo hostDest no subscribe) realizando um post com o seguinte body:
```bash

{
  from: string;
  to: string;
  contractAddress: string;
  rawData: string;
  rawTransactionData: string;
  dateTime: Date;
  blockNumber: number;
  event: string | null;
}

```
Onde:
- from - Terá o endereço web3 do acionador da transação
- to - Terá o endereço web3 do destino da transação
- contractAddress - Terá o endereço web3 do contrato envolvido na transação, geralmente o mesmo valor que do campo "to"
- rawData - Terá um json formatado para string (stringfy) com um array contendo os logs da transação. Para cada item do array, os seguintes campos existirão:
  - encodedSign - A string com a assinatura específica do evento a que o log se refere (exemplo: "Transfer(address,address,uint256)")
  - logIndex - Número inteiro com a ordem de 0 a N de cada log
  - log - Json com o log propriamente dito da transação
- rawTransaction - Json com o "transaction receipt" da trasação em questão
- dateTime - DateTime com o valor vindo do timestamp do bloco web3 onde se encontra a transação monitorada
- blockNumber - Número do bloco web3 onde se encontra a transação 
- event - Se a subscrição for específica para um evento (campo "event" preenchido no momento de criar a subscrição) este campo irá conter:
  - encodedSign - A string com a assinatura específica do evento a que o log se refere (exemplo: "Transfer(address,address,uint256)")
  - logIndex - Número inteiro com a ordem de 0 a N de cada log
  - log - Json com o log propriamente dito da transação