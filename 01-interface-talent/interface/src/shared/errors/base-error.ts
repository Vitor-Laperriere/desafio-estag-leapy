export abstract class BaseError extends Error {
  public readonly cause?: unknown;

  protected constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = new.target.name;
    this.cause = options?.cause;
  }
}
