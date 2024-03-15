export class TransactionDTO {
    from: string;
    to: string;
    contractAddress: string;
    rawData: string;
    rawTransactionData: bigint;
    dateTime: Date;
    blockNumber: number;
    event: string | null;
  }