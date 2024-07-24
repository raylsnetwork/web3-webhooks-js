export class TransactionDTO {
    from: string;
    to: string;
    contractAddress: string;
    rawData: string;
    rawTransactionData: string;
    dateTime: Date;
    blockNumber: number;
    event: string | null;
  }