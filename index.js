require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))
app.use(express.static('dist'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
  let totalPersons = 0
  const timeRequest = new Date()

  Person.find({}).then(persons => {
    totalPersons = persons.length
    response.send('<p>Phonebook has info for ' + totalPersons + ' people</p><p>' + timeRequest + '</p>')
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => {
    response.status(404).end()
  })
})

const generateId = () => {
    return Math.floor(Math.random() * 999999);
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name || !body.number) {
        return response.status(400).json({ error: 'Name or number missing' })
    }

    /*const duplicate = persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())

    if (duplicate) {
      return response.status(400).json({
        error: 'Name must be unique'
      })
    }*/

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })
    
    newPerson.save().then(savedPerson => {
      response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id).then(person => {
      response.status(204).end()
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})