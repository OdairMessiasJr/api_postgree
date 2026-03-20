// routes/userRoutes.js 
const express = require('express'); 
const router = express.Router(); 
const userController = require('../controllers/userController'); 

// Lista todos os usuários
router.get('/', userController.getUsers); 
 
// Cria um novo usuário (espera nome, cpf, email, telefone no body)
router.post('/', userController.createUser); 
 
// Atualiza um usuário pelo ID (espera nome, cpf, email, telefone no body)
router.put('/:id', userController.updateUser); 
 
// Remove um usuário pelo ID
router.delete('/:id', userController.deleteUser); 
 
module.exports = router;