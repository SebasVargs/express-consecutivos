const express = require('express')
const router = express.Router()
const personaController = require('../controllers/personaController')

router
    .route('/')
    .get(personaController.getPersonas)
    .post(personaController.createPersona)

router
    .route('/:id')
    .get(personaController.getPersonaById)
    .put(personaController.updatePersona)
    .delete(personaController.deletePersona)

module.exports = router