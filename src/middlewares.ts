import { NextFunction, Request, Response } from "express";
import { ApplicationValidationError } from "./errors/application-validation.error";
import { DocumentNotFoundError } from "./errors/document-not-found.error";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ApplicationValidationError) {
    return res.status(422).send({ errors: err.errors });
  }

  if (err instanceof DocumentNotFoundError) {
    return res.status(404).send({ error: err.message });
  }
  
  return res.status(500).send();
}