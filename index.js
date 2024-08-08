const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))

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

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const totalPersons = persons.length
    const timeRequest = new Date();
    response.send('<p>Phonebook has info for ' + totalPersons + ' people</p><p>' + timeRequest + '</p>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
 
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }    
})

const generateId = () => {
    return Math.floor(Math.random() * 999999);
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number missing'
        })
    }

    const duplicate = persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())

    if (duplicate) {
      return response.status(400).json({
        error: 'Name must be unique'
      })
    }

    const newPerson = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
  
    persons = persons.concat(newPerson)

    response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})