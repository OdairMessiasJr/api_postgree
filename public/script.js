// Aguarda o carregamento completo do HTML antes de executar o script
// Isso garante que todos os elementos da página (como o formulário e os botões) já existem na tela
document.addEventListener('DOMContentLoaded', () => {
    
    // Captura os elementos do HTML usando seus IDs para podermos interagir com eles via JavaScript
    const form = document.getElementById('cadastro-form'); // O formulário inteiro
    const submitBtn = document.getElementById('submit-btn'); // O botão vermelho de cadastrar
    const alertBox = document.getElementById('alert-message'); // A caixa invisível de mensagens (sucesso/erro)

    // ==========================================
    // 1. MÁSCARA DE CPF
    // ==========================================
    // Captura o campo de entrada (input) do CPF
    const cpfInput = document.getElementById('cpf');
    
    // O evento 'input' é disparado toda vez que o usuário digita ou apaga algo no campo
    cpfInput.addEventListener('input', function() {
        // Remove tudo que NÃO for número (a expressão /\D/g significa "qualquer caractere não numérico")
        let value = this.value.replace(/\D/g, '');
        
        // Limita o tamanho máximo para 11 números, descartando o resto
        if (value.length > 11) value = value.slice(0, 11);
        
        // Formata os números recolhidos no padrão visual do CPF (000.000.000-00) 
        // usando Expressões Regulares (Regex) com "Grupos de Captura" ($1, $2, $3, $4)
        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        }
        
        // Atualiza DE FATO o valor visual do campo na tela com a formatação recém-aplicada
        this.value = value;
    });

    // ==========================================
    // 2. MÁSCARA DE TELEFONE
    // ==========================================
    // Mesma lógica de formatação do CPF, mas formatado como (11) 90000-0000
    const telInput = document.getElementById('telefone');
    
    telInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/(\d{0,2})/, "($1");
        }
        this.value = value;
    });

    // ==========================================
    // 3. FUNÇÃO AUXILIAR PARA O ALERTA
    // ==========================================
    // Função para exibir as mensagens na tela indicando se o cadastro deu certo ou errado
    const showAlert = (message, type) => {
        alertBox.textContent = message; // Define o texto da mensagem no DOM
        alertBox.className = `alert ${type}`; // Aplica a classe do CSS na div (tipos: alert success ou alert error)
        alertBox.classList.remove('hidden'); // Remove a classe que esconde ('hidden') a caixa para torná-la visível
        
        // Define um temporizador (setTimeout). Sua função é esconder o alerta devolvendo o atributo hidden 
        // automaticamente após 5 segundos (5000 milissegundos).
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 5000);
    };

    // ==========================================
    // 4. ENVIANDO PARA O BANCO DE DADOS (USANDO FETCH)
    // ==========================================
    // Captura o evento de 'submit' (envio) disparado pelo formulário (quando clica em Cadastrar)
    // É uma função 'async' (assíncrona) pois o 'await' só sobrevive dentro do Async.
    form.addEventListener('submit', async (e) => {
        
        // PREVINE O COMPORTAMENTO PADRÃO do formulário no navegador (seria recarregar a tela num "piscar" de olhos e apagar as suas informações e não funcionar as outras coisas em JS)
        e.preventDefault();

        // Extrai o que o usuário preencheu e "limpa" os espaços vazios residuais com .trim()
        const nome = document.getElementById('nome').value.trim();
        const cpfRaw = document.getElementById('cpf').value; // Envia pro BD na formatação visual "000.000.000-00"
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value;

        // Adiciona a classe 'loading' no botão para rodar aquele CSS de mostrar um Spinner de carrega (Aguardando o Servidor)
        submitBtn.classList.add('loading');
        
        // Desabilita o pressionar do botão para o usuário não clicar mil vezes e duplicar no banco
        submitBtn.disabled = true; 
        
        // Esconde qualquer alerta que esteja na tela no momento
        alertBox.classList.add('hidden'); 

        try {
            // "Fetch API": Ferramenta nativa do navegador que liga o Front com o Back
            // "await" faz a aplicação literalmente "E S P E R A R" até que o servidor na porta 3000 nos dê uma resposta (cujo momento pode ser incerto se ele demorar 2 minutos para acessar o banco, o App o aguarda)
            const response = await fetch('/clientes', {
                method: 'POST', // Precisamos CRIAR registros, portanto POST (poderia ser GET para buscar ou DELETE)
                headers: {
                    // Avisa nossa API do Express e Node que a conversa será nos padrões de "arquivos JSON"
                    'Content-Type': 'application/json' 
                },
                // Embala nossas 4 variáveis preenchidas no payload e as manda para o servidor API traduzidas com stringify()
                body: JSON.stringify({
                    nome,
                    cpf: cpfRaw,
                    email,
                    telefone
                })
            });

            // Se a resposta HTTP for da família "Sucesso - Tudo Certo" (Status de respostas que estão em 200.. 201)
            if (response.ok) {
                showAlert('Cliente cadastrado com sucesso!', 'success');
                // Após tudo ok, reseta (esvazia) todos os campos de input digitáveis na tela do front
                form.reset();
            } else {
                // Se o servidor avisar algum erro (Ex: Erro 400 - Preencheu Errado, Erro 500 - Base caiu)
                const errorData = await response.json().catch(() => null);
                // Extraímos a própria mensagem de erro vinda do Node ou retornamos genérica 
                const errorMsg = errorData && errorData.error ? errorData.error : 'Ocorreu um erro ao cadastrar o cliente.';
                showAlert(errorMsg, 'error');
            }
            
        } catch (error) {
            // Este bloco 'catch' é a "Peneira Grossa" dos erros: acontece se o App estiver Offilne (Ex: Cliente sem Wi-Fi) 
            console.error('Erro de Rede:', error);
            showAlert('Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente mais tarde.', 'error');
        } finally {
            // O bloco 'finally' sempre será ativado! Tendo sucesso de inserção no banco e também falhas catástroficas e de rede. O Seu papel aqui é encerrar o "Estado de Carregamento" liberando a liberação do JS.
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
});
