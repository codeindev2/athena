type SafeAsyncSuccess<T> = [error: undefined, data: T]
type SafeAsyncError = [error: Error, data: undefined]
type SafeAsync<T> = SafeAsyncSuccess<T> | SafeAsyncError
// O trecho de código desse arquivo é um tipo de retorno de função que pode ser usado para lidar com
// funções assíncronas de forma segura, retornando um array com dois elementos, o primeiro é um erro, que
// pode ser undefined, e o segundo é o resultado da função, que também pode ser undefined.
// Isso permite que o código que chama a função assíncrona possa lidar com possíveis erros
// de forma mais segura, evitando que a aplicação quebre caso ocorra um erro durante a execução da função assíncrona.
export async function safeAsync<T>(
  callback: () => Promise<T>,
): Promise<SafeAsync<T>> {
  try {
    const result = await callback()
    return [undefined, result]
  } catch (error) {
    if (error instanceof Error) {
      return [error, undefined]
    }
    return [new Error(String(error)), undefined]
  }
}
