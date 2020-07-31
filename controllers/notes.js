const notesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })

  if (notes) {
    res.json(notes)
  } else {
    res.status(404).end()
  }
})

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)

  if (note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})

notesRouter.delete('/:id', async (req, res) => {
  await Note.findByIdAndRemove(req.params.id)
  res.status(204).end()
})

const getTokenFrom = (req, res) => {
  const authorization = req.get('authorization')

  if (!authorization) {
    return res.status(401).json({ error: 'invalid request: token missing' })
  }

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }

  return null
}

notesRouter.post('/', async (req, res) => {
  const body = req.body

  const token = getTokenFrom(req, res)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  res.json(savedNote)
})

notesRouter.put('/:id', async (req, res) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, { new: true })
  res.json(updatedNote)
})

module.exports = notesRouter