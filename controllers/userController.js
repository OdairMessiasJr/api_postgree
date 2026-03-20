// controllers/userController.js
const userModel = require('../models/userModel'); 

// 1. READ (GET /clientes) - Buscar todos 
exports.getUsers = async (req, res) => { 
  try { 
    const clientes = await userModel.findAll(); 
    res.json(clientes);  
  } catch (err) { 
    console.error('Erro ao buscar usuários:', err); 
    res.status(500).json({ error: 'Erro interno ao buscar usuários' }); 
  } 
}; 

// 2. CREATE (POST /clientes) - Criar novo 
exports.createUser = async (req, res) => { 
    // Extraímos os 4 campos do corpo da requisição
    const { nome, cpf, email,  telefone} = req.body;  
     
    // Validação: Todos os campos são obrigatórios para o cadastro
    if (!nome || !cpf || !email || !telefone) { 
        return res.status(400).json({ error: 'Os campos nome, cpf, email e telefone são obrigatórios.' }); 
    } 

    try { 
        // Passamos os 4 campos para o Model
        const newUser = await userModel.create(nome, cpf, email, telefone); 
        res.status(201).json(newUser);  
    } catch (err) { 
        console.error('Erro ao criar usuário:', err); 
        res.status(500).json({ error: 'Erro interno ao criar usuário' }); 
    } 
}; 

// 3. UPDATE (PUT /clientes/:id) - Atualizar existente 
exports.updateUser = async (req, res) => { 
    const id = req.params.id; // Captura ID da URL 
    const { nome, cpf, email, telefone } = req.body; // Captura os novos dados
     
    // Validação mínima
    if (!nome || !cpf || !email || !telefone) { 
        return res.status(400).json({ error: 'Todos os campos são necessários para atualização.' }); 
    } 

    try { 
        // Passamos o ID e os novos campos para o Model
        const updatedUser = await userModel.update(id, nome, cpf, email, telefone); 
         
        if (!updatedUser) { 
            return res.status(404).json({ error: 'Usuário não encontrado.' }); 
        } 

        res.json(updatedUser);  
    } catch (err) { 
        console.error('Erro ao atualizar usuário:', err); 
        res.status(500).json({ error: 'Erro interno ao atualizar usuário' }); 
    } 
}; 

// 4. DELETE (DELETE /clientes/:id) - Remover existente 
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await userModel.delete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ error: 'Usuário não encontrado para exclusão.' });
        }
        
        // Retornamos o usuário deletado ou apenas uma mensagem de sucesso
        res.json({ message: 'Usuário removido com sucesso', user: deletedUser });
    } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        res.status(500).json({ error: 'Erro interno ao deletar usuário' });
    }
};