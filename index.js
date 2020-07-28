require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')

const cors = require('cors')
const morgan = require('morgan')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'))

app.get('/', (req, res) => {
  res.send('<h1>Notes application</h1>')
})

app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await Note.find({})

    if (notes) {
      res.json(notes)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

app.get('/api/notes/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)

    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    await Note.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/notes', async (req, res, next) => {
  const body = req.body

  // if (!body.content) {
  //     return res.status(400).json({
  //         error: 'content missing'
  //     })
  // }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  try {
    const savedNote = await note.save()
    res.json(savedNote)
  } catch (error) {
    next(error)
  }
})

app.put('/api/notes/:id', async (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important
  }

  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, { new: true })
    res.json(updatedNote)
  } catch (error) {
    next(error)
  }
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' || error.name === 'ReferenceError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})