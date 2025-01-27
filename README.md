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

Exemplo de body que virá no retorno do webhook para a url inscrita (via post, Content-Type: application/json)
```bash

{
  
  "from":"0xE49bb8061Aae80cBaCc8f1211C3e3746718FA213",
  
  "to":"0x6FE39C7b4A3B096A3Cf404f0Fad5776377457df2",
  
  "contractAddress":null,
  
  "rawData":"[{\"encodedSign\":\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\"logIndex\":0,\"log\":{\"_type\":\"log\",\"address\":\"0x6FE39C7b4A3B096A3Cf404f0Fad5776377457df2\",\"blockHash\":\"0x7ea1d0fd68a3f0f4c194b1552156309b0f422a26a228536f1e3b5f93b567902d\",\"blockNumber\":7863933,\"data\":\"0x0000000000000000000000000000000000000000000000008ac7230489e80000\",\"index\":0,\"topics\":[\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\"0x000000000000000000000000e49bb8061aae80cbacc8f1211c3e3746718fa213\",\"0x0000000000000000000000005e780ccc1dcb876a09ca2488ebe0b547fba649a8\"],\"transactionHash\":\"0x2027642a6b70427948a0e172362c6ec00589179994b976a3e299da108f460f0d\",\"transactionIndex\":0}}]",
  
  "rawTransactionData":"{\"_type\":\"TransactionReceipt\",\"blockHash\":\"0x7ea1d0fd68a3f0f4c194b1552156309b0f422a26a228536f1e3b5f93b567902d\",\"blockNumber\":7863933,\"contractAddress\":null,\"cumulativeGasUsed\":\"23303\",\"from\":\"0xE49bb8061Aae80cBaCc8f1211C3e3746718FA213\",\"gasPrice\":\"0\",\"blobGasUsed\":null,\"blobGasPrice\":null,\"gasUsed\":\"23303\",\"hash\":\"0x2027642a6b70427948a0e172362c6ec00589179994b976a3e299da108f460f0d\",\"index\":0,\"logs\":[{\"_type\":\"log\",\"address\":\"0x6FE39C7b4A3B096A3Cf404f0Fad5776377457df2\",\"blockHash\":\"0x7ea1d0fd68a3f0f4c194b1552156309b0f422a26a228536f1e3b5f93b567902d\",\"blockNumber\":7863933,\"data\":\"0x0000000000000000000000000000000000000000000000008ac7230489e80000\",\"index\":0,\"topics\":[\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\"0x000000000000000000000000e49bb8061aae80cbacc8f1211c3e3746718fa213\",\"0x0000000000000000000000005e780ccc1dcb876a09ca2488ebe0b547fba649a8\"],\"transactionHash\":\"0x2027642a6b70427948a0e172362c6ec00589179994b976a3e299da108f460f0d\",\"transactionIndex\":0}],\"logsBloom\":\"0x0000000000000000000000000020000000200000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000002000000000000000000000000400000000000000000000000000000000010020000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000\",\"status\":1,\"to\":\"0x6FE39C7b4A3B096A3Cf404f0Fad5776377457df2\"}",
  
  "dateTime":"2025-01-27T20:07:27.000Z",
  
  "blockNumber":7863933,
  
  "event":"[{\"encodedSign\":\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\"logIndex\":0,\"log\":{\"_type\":\"log\",\"address\":\"0x6FE39C7b4A3B096A3Cf404f0Fad5776377457df2\",\"blockHash\":\"0x7ea1d0fd68a3f0f4c194b1552156309b0f422a26a228536f1e3b5f93b567902d\",\"blockNumber\":7863933,\"data\":\"0x0000000000000000000000000000000000000000000000008ac7230489e80000\",\"index\":0,\"topics\":[\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\"0x000000000000000000000000e49bb8061aae80cbacc8f1211c3e3746718fa213\",\"0x0000000000000000000000005e780ccc1dcb876a09ca2488ebe0b547fba649a8\"],\"transactionHash\":\"0x2027642a6b70427948a0e172362c6ec00589179994b976a3e299da108f460f0d\",\"transactionIndex\":0}}]"
  
}

```