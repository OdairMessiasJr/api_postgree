// Aguarda o HTML completo ser carregado na tela
document.addEventListener('DOMContentLoaded', () => {
    
    // Captura os elementos do DOM da página Consulta
    const clientsGrid = document.getElementById('clients-grid');
    const searchInput = document.getElementById('search-input');
    const loadingState = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const noResults = document.getElementById('no-results');

    // ==========================================
    // ELEMENTOS DOS MODAIS (EDIÇÃO E EXCLUSÃO)
    // ==========================================
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    // Formulário de Edição
    const editForm = document.getElementById('edit-form');
    const editIdInput = document.getElementById('edit-id');
    const editNomeInput = document.getElementById('edit-nome');
    const editCpfInput = document.getElementById('edit-cpf');
    const editEmailInput = document.getElementById('edit-email');
    const editTelefoneInput = document.getElementById('edit-telefone');
    
    // Alertas nos Modais
    const modalAlertBox = document.getElementById('modal-alert-message');
    const deleteAlertBox = document.getElementById('delete-alert-message');

    // Mantenha essa variável global para que possamos manipular os clientes lidos
    let allClients = [];

    // ==========================================
    // 1. LÓGICA DE MÁSCARAS (IGUAL AO CADASTRO)
    // ==========================================
    // O ideal seria criar uma função global (em outro arquivo), mas para fins didáticos:
    editCpfInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        else if (value.length > 3) value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        this.value = value;
    });

    editTelefoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 10) value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        else if (value.length > 6) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        else if (value.length > 2) value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
        else if (value.length > 0) value = value.replace(/(\d{0,2})/, "($1");
        this.value = value;
    });

    // ==========================================
    // 2. BUSCAR CLIENTES (GET)
    // ==========================================
    const fetchClients = async () => {
        try {
            const response = await fetch('/clientes');
            if (!response.ok) throw new Error('Falha ao carregar os dados.');
            allClients = await response.json();
            
            // Renderiza apenas quando tiver certeza que trouxe a lista
            renderClients(allClients);
        } catch (error) {
            console.error('Erro:', error);
            errorMessage.textContent = 'Não foi possível carregar os clientes. Tente novamente mais tarde.';
            errorMessage.classList.remove('hidden');
        } finally {
            loadingState.classList.add('hidden');
        }
    };

    // ==========================================
    // 3. FUNÇÃO QUE ABRE O MODAL PARA EDITAR
    // ==========================================
    // Esta função é Global (window) para que os botões gerados dinamicamente no HTML consigam acessá-la
    window.openEditModal = (id) => {
        // Encontra o cliente exato no array de clientes globais que bate com o ID clicado
        // find retorna o PRIMEIRO elemento que bater a condição
        const client = allClients.find(c => String(c.id) === String(id));
        
        if (client) {
            // Preenche os campos do form de edição com os dados que estavam no banco
            editIdInput.value = client.id;
            editNomeInput.value = client.nome;
            editCpfInput.value = client.cpf || '';
            editEmailInput.value = client.email;
            editTelefoneInput.value = client.telefone || '';
            
            // Esconde alertas velhos e abre o modal (removendo a classe hidden que esconde visualmente e desabilita clique)
            modalAlertBox.classList.add('hidden');
            editModal.classList.remove('hidden');
        }
    };

    // ==========================================
    // 4. FUNÇÃO QUE ABRE O MODAL DE EXCLUIR
    // ==========================================
    // Variável para guardar o ID sendo excluido em andamento
    let deleteTargetId = null;

    window.openDeleteModal = (id, nome) => {
        deleteTargetId = id; // Trava o alvo na mira
        document.getElementById('delete-client-name').textContent = nome; // Destaca o nome no aviso
        deleteAlertBox.classList.add('hidden');
        deleteModal.classList.remove('hidden'); // Exibe o Modal
    };

    // Fechar os modais no X
    document.getElementById('close-edit-modal').addEventListener('click', () => editModal.classList.add('hidden'));
    document.getElementById('close-delete-modal').addEventListener('click', () => deleteModal.classList.add('hidden'));
    document.getElementById('cancel-delete-btn').addEventListener('click', () => deleteModal.classList.add('hidden'));


    // ==========================================
    // 5. ATUALIZAR UM CLIENTE (PUT)
    // ==========================================
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o F5 da página

        const id = editIdInput.value;
        const nome = editNomeInput.value.trim();
        const cpfRaw = editCpfInput.value;
        const email = editEmailInput.value.trim();
        const telefone = editTelefoneInput.value;

        const saveBtn = document.getElementById('save-edit-btn');
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;

        try {
            // Fazemos POST no cadastro, mas para MUDAR algo que já existe, a convenção REST manda usar PUT
            // Passamos o ID pela URL pois é assim que a rota do nosso Backend (express) está configurada '/clientes/:id'
            const response = await fetch(`/clientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, cpf: cpfRaw, email, telefone })
            });

            if (response.ok) {
                // Ao dar certo, fechamos o modal e ATUALIZAMOS a lista toda!
                editModal.classList.add('hidden');
                
                // Em aplicações reais pequenas, apenas pedir para baixar a lista de novo funciona (fetchClients)
                // É mais fácil re-renderizar do que caçar o card na tela.
                await fetchClients();
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMsg = errorData && errorData.error ? errorData.error : 'Erro ao atualizar o cliente.';
                modalAlertBox.textContent = errorMsg;
                modalAlertBox.className = 'alert error';
                modalAlertBox.classList.remove('hidden');
            }
        } catch (error) {
            modalAlertBox.textContent = 'Erro de Rede. Verifique sua conexão.';
            modalAlertBox.className = 'alert error';
            modalAlertBox.classList.remove('hidden');
        } finally {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    });

    // ==========================================
    // 6. EXCLUIR UM CLIENTE (DELETE)
    // ==========================================
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (!deleteTargetId) return; // Se por algum milagre não tiver alvo fixado, encerra o código.

        const deleteBtn = document.getElementById('confirm-delete-btn');
        deleteBtn.classList.add('loading');
        deleteBtn.disabled = true;

        try {
            // Requisição com método exclusivo DELETE para o ID capturado do banco
            const response = await fetch(`/clientes/${deleteTargetId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Fechamos a janela e re-renderizamos a lista recarregando do Banco!
                deleteModal.classList.add('hidden');
                await fetchClients();
            } else {
                const errorData = await response.json().catch(() => null);
                deleteAlertBox.textContent = errorData && errorData.error ? errorData.error : 'Erro ao excluir o cliente.';
                deleteAlertBox.className = 'alert error';
                deleteAlertBox.classList.remove('hidden');
            }
        } catch (error) {
            deleteAlertBox.textContent = 'Falha na conexão de rede!';
            deleteAlertBox.className = 'alert error';
            deleteAlertBox.classList.remove('hidden');
        } finally {
            deleteBtn.classList.remove('loading');
            deleteBtn.disabled = false;
        }
    });

    // ==========================================
    // 7. RENDERIZAR OS DADOS (DESENHAR NA TELA)
    // ==========================================
    const renderClients = (clients) => {
        clientsGrid.innerHTML = '';
        
        if (clients.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }
        
        noResults.classList.add('hidden');

        clients.forEach((client, index) => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.style.animationDelay = `${(index % 10) * 0.05}s`;
            
            // A novidade aqui é que embutimos event listeners no nosso HTML usando 'onclick' 
            // Eles chamam nossas funções globais openEditModal(id) e openDeleteModal(id, nome)
            // Lembre-se que strings devem ser protegidas por aspas, então convertemos com aspas simples para "nome".
            card.innerHTML = `
                <div class="client-header">
                    <div>
                        <div class="client-name">${client.nome}</div>
                    </div>
                    <div class="client-id">ID: ${client.id}</div>
                </div>
                <div class="client-detail">
                    <strong>CPF:</strong> ${client.cpf || 'Não informado'}
                </div>
                <div class="client-detail">
                    <strong>E-mail:</strong> ${client.email || 'Não informado'}
                </div>
                <div class="client-detail">
                    <strong>Telefone:</strong> ${client.telefone || 'Não informado'}
                </div>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal('${client.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn-icon btn-delete" onclick="openDeleteModal('${client.id}', '${client.nome.replace(/'/g, "\\'")}')">
                        🗑️ Excluir
                    </button>
                </div>
            `;
            
            clientsGrid.appendChild(card);
        });
    };

    // ==========================================
    // 8. FILTRO (DEBOUNCE SEARCH)
    // ==========================================
    const filterClients = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return renderClients(allClients);

        const filtered = allClients.filter(client => {
            const nomeMatch = (client.nome || '').toLowerCase().includes(query);
            const idMatch = String(client.id).toLowerCase() === query || String(client.id).includes(query);
            const telLimpo = (client.telefone || '').replace(/\D/g, '');
            const queryLimpa = query.replace(/\D/g, '');
            const telMatchRegex = (client.telefone || '').toLowerCase().includes(query);
            const telMatchNumeros = queryLimpa && telLimpo.includes(queryLimpa);
            
            return nomeMatch || idMatch || telMatchRegex || telMatchNumeros;
        });

        renderClients(filtered);
    };

    let timeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(filterClients, 300);
    });

    // START
    fetchClients();
});
