import { prisma } from './db';
import { ethers } from 'ethers';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { TransactionDTO } from 'src/transaction.dto';

dotenv.config();

export async function monitorBlocks(): Promise<void> {

  const ws = new ethers.WebSocketProvider(process.env.WSConnect);
  
  const healthInterval = setInterval(() => {
    const state = ws.websocket.readyState;
    if (state !== 1) {
      console.warn(`Health-check: WebSocket não está aberto (readyState=${state}), reiniciando monitor…`);
      clearInterval(healthInterval);
      try { ws.websocket.close(); } catch {}
      void monitorBlocks();
    }
  }, 30000);

  ws.on('error', err => {
    console.error('WebSocket error:', err);
    // força reinício imediato
    clearInterval(healthInterval);
    try { ws.websocket.close(); } catch {}
    setTimeout(() => void monitorBlocks(), 1000);
  });

  ws.on('block', async (blockNumber) => {
    try {
      console.log("##### Starting Block Process ##### Block:", blockNumber);
      const block = await ws.getBlock(blockNumber);

          // console.log("##### Starting Block Process ##### Block:", block);

          if (block.transactions.length > 0) {
            for (
              let index = 0;
              index < block.transactions.length;
              index++
            ) {
              const txHash = block.transactions[index];
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
              
              const blockTime = new Date(block.timestamp * 1000);
              let transactionDTO = new TransactionDTO();
              transactionDTO.from= transaction.from;
              transactionDTO.to= transaction.to;
              transactionDTO.contractAddress= transaction.contractAddress;
              transactionDTO.rawTransactionData= JSON.stringify(transaction);
              transactionDTO.dateTime= blockTime;
              transactionDTO.blockNumber= transaction.blockNumber;

              for (let i = 0; i < subscribe.length; i++) {
                const sub = subscribe[i];
                let eventsToSub = events;
                if(sub.event!=null){
                  const especifcEvent = events.filter(e=>e.encodedSign==ethers.id(sub.event));
                  transactionDTO.event = JSON.stringify(especifcEvent);
                }
                transactionDTO.rawData = JSON.stringify(eventsToSub);
                console.log("transactionDTO..:",transactionDTO);
                console.log("fetch post to..:",sub.hostDest);
                try {
                  await fetch(sub.hostDest, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionDTO),
                  });
                } catch (e) {
                  console.error('Error posting webhook to', sub.hostDest, e);
                }
              }
            }
          }

          console.log("##### Block Process Finished ##### Block:", blockNumber);
    } catch (err) {
      console.error(`Error processing block ${blockNumber}:`, err);
    }
  });

  console.log('WebSocket readyState:', ws.websocket.readyState);
}
export default monitorBlocks;
