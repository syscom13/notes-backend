require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')

const cors = require('cors')
const morgan = require('morgan')

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2019-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2019-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2019-05-30T19:20:14.298Z",
        important: true
    }
]

app.use(express.json())
app.use(cors())
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body'))
app.use(express.static('build'))

app.get('/', (req, res) => {
    res.send('<h1>Notes application</h1>')
})

app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find({})
        res.json(notes)
    } catch (error) {
        res.status(404).end()
    }
})

app.get('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
        res.json(note)
    } catch (error) {
        res.status(404).end()
    }
})

app.delete('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id)
    notes = notes.filter(note => note.id !== id)
    
    res.status(204).end()
})

app.post('/api/notes', async (req, res) => {
    const body = req.body

    if (!body.content) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date()
    })

    try {
        const savedNote = await note.save() 
        res.json(savedNote) 
    } catch (error) {
        console.log(error)
    }
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})