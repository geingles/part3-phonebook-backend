require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const personService = require('./models/person')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'))
app.use(express.static('dist'))

app.get('/info', (request, response, next) => {
  let totalPersons = 0
  const timeRequest = new Date()

  personService.find({}).then(persons => {
    totalPersons = persons.length
    response.send('<p>Phonebook has info for ' + totalPersons + ' people</p><p>' + timeRequest + '</p>')
  })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  personService.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  personService.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if(!body.name || !body.number) {
    return response.status(400).json({ error: 'Name or number missing' })
  }

  const newPerson = new personService({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch( error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  personService.findByIdAndDelete(request.params.id).then(person => {
    response.status(204).end()
  })
    .catch( error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  personService.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})