export type TransactionCallback<T> = (
  tx: PrismaTransactionClient,
) => Promise<T>;
