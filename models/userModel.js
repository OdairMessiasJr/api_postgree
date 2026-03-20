// models/userModel.js 
const pool = require('../db'); 

// 1. GET (Listar todos)
exports.findAll = async () => { 
    const text = 'SELECT id, nome, cpf, email, telefone FROM clientes ORDER BY id'; 
    const result = await pool.query(text); 
    return result.rows;  
};

// 2. POST (Criar novo)
exports.create = async (nome, cpf, email, telefone) => { 
    const text = `
        INSERT INTO clientes(nome, cpf, email, telefone) 
        VALUES($1, $2, $3, $4) 
        RETURNING *`; 
    const values = [nome, cpf, email, telefone];  
    const result = await pool.query(text, values); 
    return result.rows[0]; 
};

// 3. PUT (Atualizar existente)
exports.update = async (id, nome, cpf, email, telefone) => {
    const text = `
        UPDATE clientes 
        SET nome = $1, cpf = $2, email = $3, telefone = $4 
        WHERE id = $5 
        RETURNING *`;
    const values = [nome, cpf, email, telefone, id];
    const result = await pool.query(text, values);
    return result.rows[0]; // Retorna o registro atualizado ou undefined se não achar o ID
};

// 4. DELETE (Remover registro)
exports.delete = async (id) => {
    const text = 'DELETE FROM clientes WHERE id = $1 RETURNING *';
    const values = [id];
    const result = await pool.query(text, values);
    return result.rows[0]; // Retorna o registro que foi deletado para confirmação
};