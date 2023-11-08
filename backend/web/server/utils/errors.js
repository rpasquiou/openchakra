const mongoose = require('mongoose')
const {MongoError}=require('mongodb')

const HTTP_CODES={
  BAD_REQUEST: 400,
  NOT_LOGGED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SYSTEM_ERROR: 500,
}

class StatusError extends Error {

  constructor(message, status) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name=this.constructor.name
    this.status=status
  }
}

class NotFoundError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.NOT_FOUND)
  }
}

class NotLoggedError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.NOT_LOGGED)
  }
}

class ForbiddenError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.FORBIDDEN)
  }
}

class BadRequestError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.BAD_REQUEST)
  }
}

class ConflictError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.CONFLICT)
  }
}

class UnprocessableEntityError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.UNPROCESSABLE_ENTITY)
  }
}

class SystemError extends StatusError {
  constructor(message) {
    super(message, HTTP_CODES.SYSTEM_ERROR)
  }
}

const parseError = err => {

  // Parse duplicate key error
  if (err instanceof MongoError && err.code==11000) {
    return {
      status: HTTP_CODES.CONFLICT,
      body: 'La donnée doit être unique',
    }
  }

  // Parse other mongoose error
  if (err instanceof mongoose.Error.ValidationError) {
    const message=Object.values(err.errors)?.join(', ')
    return {
      status: HTTP_CODES.UNPROCESSABLE_ENTITY,
      body: message,
    }
  }
  return {
    status: err.status || HTTP_CODES.SYSTEM_ERROR,
    body: err.message || err,
  }
}

module.exports={
  StatusError, NotFoundError, ForbiddenError, BadRequestError, SystemError,
  NotLoggedError, ConflictError,
  HTTP_CODES,
  parseError,
}
