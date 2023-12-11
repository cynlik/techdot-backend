import { HttpStatus } from './constant'

export class CustomError extends Error {
  status: HttpStatus

  constructor(status: HttpStatus, message: string) {
    super(message)
    this.status = status
  }
}
