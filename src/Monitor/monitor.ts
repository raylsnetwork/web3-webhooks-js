import { prisma } from './db';
import * as ethers from 'ethers';
import fetch from 'node-fetch';

import { TransactionDTO } from 'src/transaction.dto';


async function monitorBlocks(): Promise<void> {
  console.log("monitorblocks called")
  return new Promise(async (_, reject) => {
    try {
      console.log("monitorblocks promise called")
      //leer documentacion de websocketprovider y encontrar en ethers encodesignature
      
      const ws = new ethers.ethers.WebSocketProvider(process.env.WSConnect);
      ws.on('block', async (block) => {
        console.log("henrique pidiu")
        try {
          const blockComplete = await ws.getBlock(block);
          console.log("block:", block);
          console.log("blocktransactions:", blockComplete.transactions);
          //Se houve transações, verifico se tenho subscribe para o to.

          if (blockComplete.transactions.length > 0) {
            for (
              let index = 0;
              index < blockComplete.transactions.length;
              index++
            ) {
              const txHash = blockComplete.transactions[index];
              const transaction = await ws.getTransactionReceipt(txHash);
              const addresses = [];
              const eventEncodedSigns = [];
              addresses.push(transaction.from);
              addresses.push(transaction.to);
              //addresses.push(transaction.contractAddress)
              //const eventSignature: string = 'Transfer(address,address,uint256)'
              //abixsignature
              //const eventTopic: string = ethers.id(eventSignature);
              //console.log("topic",eventTopic)

              if (transaction.logs.length > 0) {
                for (let i = 0; i < transaction.logs.length; i++) {
                  const log = transaction.logs[i];
                  if (log.topics.length> 0){
                    eventEncodedSigns.push(log.topics[0])
                  }
                }
              }
              console.log("eventos", eventEncodedSigns)
              //obtem as pessoas que seram avisadas se tiver um endereço envolvido que esteja no subscribe
              let subscribe = await prisma.subscribe.findMany({
                where: {
                  address: {
                    in: addresses,
                    mode: 'insensitive',
                  }
                },
                distinct: ['id'],
              });
              console.log("subscribe antes do filtro de eventos", subscribe)
              //caso o subscribe seja para um evento especifico, remove caso no tenha o evento correto 
              subscribe = subscribe.filter(s=>
                s.event==null
                ||eventEncodedSigns.filter(e=>e==ethers.id(s.event)).length>0
              );
              console.log("subscribe depois do filtro de eventos", subscribe)
              console.log("filtros:", subscribe.filter(s => s.event == null || eventEncodedSigns.find(e => e == s.event)));

              let transactionDTO = new TransactionDTO();
              transactionDTO.from= transaction.from;
              transactionDTO.to= transaction.to;
              transactionDTO.contractAddress= transaction.contractAddress;
              transactionDTO.rawData=  transaction.hash, transaction.blockHash;
              transactionDTO.rawTransactionData= transaction.gasUsed,transaction.gasPrice;
              //transactionDTO.dateTime= transaction.time;
              transactionDTO.blockNumber= transaction.blockNumber;

              console.log("transactionDTO:",transactionDTO);
              console.log("subscribe:", subscribe);
              for (const sub of subscribe) {
                fetch(sub.hostDest, {
                  body: JSON.stringify(transactionDTO),
                  method: 'POST',
                });
              }
              console.log(transaction);

              
            }
          }
        } catch (error) {
          reject(error);
        }
      });
      ws.on('error', (ex) => {
        console.log(ex);
        reject('error');
      });
      console.log(ws.websocket.readyState);
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  });
}
export default monitorBlocks;

