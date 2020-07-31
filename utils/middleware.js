const morgan = require('morgan')
const logger = require('./logger')

morgan.token('body', (req) => JSON.stringify(req.body))

const requestLogger = morgan(':method :url :status :response-time ms - :res[content-length] :body')

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' || error.name === 'ReferenceError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  }

  logger.error(error)

  next(error)
}

module.exports = { requestLogger, unknownEndpoint, errorHandler }