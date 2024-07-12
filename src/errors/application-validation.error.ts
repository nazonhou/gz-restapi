import { ValidationError } from "express-validator";

export class ApplicationValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super('The request is not valid');
  }
}