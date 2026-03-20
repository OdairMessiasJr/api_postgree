const express = require('express'); 
const app = express(); 
const userRoutes = require('./routes/userRoutes');  
 
// Middleware para servir os arquivos estáticos do front-end 
app.use(express.static('public')); 
 
// Middleware para interpretar JSON no corpo das requisições 
app.use(express.json()); 
 
// Aplica as rotas de usuário com o prefixo '/users' 
// O caminho '/' no userRoutes.js se torna '/users' aqui. 
app.use('/clientes', userRoutes);  
 
// Inicia o servidor na porta 3000 
app.listen(3000, () => { 
    console.log('Servidor rodando em http://localhost:3000'); 
}); 