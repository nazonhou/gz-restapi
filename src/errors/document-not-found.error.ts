export class DocumentNotFoundError extends Error {
  constructor(public readonly model: string) {
    super(`${model} document not found`);
  }
}