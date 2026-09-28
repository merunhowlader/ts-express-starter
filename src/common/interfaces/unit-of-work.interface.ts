export interface IUnitOfWork<TTransactionClient> {
  execute<T>(work: (transaction: TTransactionClient) => Promise<T>): Promise<T>;
}
