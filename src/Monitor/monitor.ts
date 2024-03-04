import { prisma } from './db';
import * as ethers from 'ethers';
import fetch from 'node-fetch';

async function monitorBlocks(): Promise<void> {
  return new Promise(async (_, reject) => {
    try {
      const ws = new ethers.ethers.WebSocketProvider(process.env.WSConnect);
      ws.on('block', async (block) => {
        try {
          const blockComplete = await ws.getBlock(block);
          console.log(block);
          console.log(blockComplete.transactions);
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
              addresses.push(transaction.from);
              addresses.push(transaction.to);
              if (transaction.logs.length > 0) {
                for (let i = 0; i < transaction.logs.length; i++) {
                  const log = transaction.logs[i];
                  addresses.push(log.address);
                }
              }
              const subscribe = await prisma.subscribe.findMany({
                where: {
                  address: {
                    in: addresses,
                    mode: 'insensitive',
                  },
                },
                distinct: ['id'],
              });

              console.log(subscribe);
              for (const sub of subscribe) {
                fetch(sub.hostDest, {
                  body: JSON.stringify(transaction),
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
