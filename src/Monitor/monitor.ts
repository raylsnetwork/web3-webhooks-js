import { prisma } from './db';
import * as ethers from 'ethers';
import fetch from 'node-fetch';

import { TransactionDTO } from 'src/transaction.dto';


async function monitorBlocks(): Promise<void> {
  
  return new Promise(async (_, reject) => {
    try {  
      const ws = new ethers.ethers.WebSocketProvider(process.env.WSConnect);
      ws.on('block', async (block) => {
        try {
          const blockComplete = await ws.getBlock(block);
          console.log("##### Starting Block Process ##### Block:", block);

          if (blockComplete.transactions.length > 0) {
            for (
              let index = 0;
              index < blockComplete.transactions.length;
              index++
            ) {
              const txHash = blockComplete.transactions[index];
              const transaction = await ws.getTransactionReceipt(txHash);
              console.log("transaction..:",transaction);
              console.log("transaction.logs..:",transaction.logs);
              const addresses = [];
              const events = [];
              if(transaction.from)
                addresses.push(transaction.from);
              if(transaction.to)
                addresses.push(transaction.to);

              if (transaction.logs.length > 0) {
                for (let i = 0; i < transaction.logs.length; i++) {
                  const log = transaction.logs[i];
                  console.log("transaction.logs["+i+"].topics..:",log.topics);
                  if (log.topics.length> 0){
                    events.push({encodedSign:log.topics[0],logIndex:i,log:log})
                  }
                }
              }
              console.log("events..:", events)
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
              const filtros = subscribe.map(s=> { 
                return {
                  sub:s,
                  sub_event: s.event,
                  matches: s.event==null ? []: events.map(e=> e.encodedSign+":"+ethers.id(s.event))
                }
              });
              console.log("filtros..:",filtros)
              subscribe = subscribe.filter(s=>
                s.event==null
                ||events.filter(e=>e.encodedSign==ethers.id(s.event)).length>0
              );
              console.log("subscribe depois do filtro de eventos", subscribe)
              
              const blockTime = new Date(blockComplete.timestamp * 1000);
              let transactionDTO = new TransactionDTO();
              transactionDTO.from= transaction.from;
              transactionDTO.to= transaction.to;
              transactionDTO.contractAddress= transaction.contractAddress;
              transactionDTO.rawTransactionData= JSON.stringify(transaction);
              transactionDTO.dateTime= blockTime;
              transactionDTO.blockNumber= transaction.blockNumber;

              for (const sub of subscribe) {
                let eventsToSub = events;
                if(sub.event!=null){
                  const especifcEvent = events.filter(e=>e.encodedSign==ethers.id(sub.event));
                  transactionDTO.event = JSON.stringify(especifcEvent);
                }
                transactionDTO.rawData = JSON.stringify(eventsToSub);
                console.log("transactionDTO..:",transactionDTO);
                console.log("fetch post to..:",sub.hostDest);
                fetch(sub.hostDest, {
                  body: JSON.stringify(transactionDTO),
                  method: 'post',
                  headers: {'Content-Type': 'application/json'}
                });
              }
            }
          }

          console.log("##### Block Process Finished ##### Block:", block);
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
