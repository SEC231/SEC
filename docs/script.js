// ... (constantes e funções validarCPF, clearErrorOnChange como antes) ...

const form = document.getElementById('registrationForm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const cpfInput = document.getElementById('cpf');
const telefoneInput = document.getElementById('telefone');

const nomeError = document.getElementById('nomeError');
const emailError = document.getElementById('emailError');
const cpfError = document.getElementById('cpfError');
const telefoneError = document.getElementById('telefoneError');

// Máscara do CPF (como antes)
cpfInput.addEventListener('input', function (e) {
    let value = e.target.value;
    value = value.replace(/\D/g, ""); 
    value = value.substring(0, 11);
    let formattedValue = "";
    if (value.length > 0) { formattedValue = value.substring(0, 3); }
    if (value.length > 3) { formattedValue += "." + value.substring(3, 6); }
    if (value.length > 6) { formattedValue += "." + value.substring(6, 9); }
    if (value.length > 9) { formattedValue += "-" + value.substring(9, 11); }
    e.target.value = formattedValue;
});

// Função validarCPF (como antes)
function validarCPF(cpf) {
    cpf = String(cpf).replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}


form.addEventListener('submit', function(event) {
    event.preventDefault();
    let isValid = true;

    // Validações (Nome, E-mail, CPF, Telefone - como antes)
    // Validação do Nome
    if (nomeInput.value.trim() === '') {
        nomeError.textContent = 'Por favor, preencha seu nome.';
        nomeError.style.display = 'inline-block'; 
        nomeInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        nomeError.style.display = 'none';
        nomeInput.style.borderColor = '#ddd';
    }

    // Validação do E-mail
    const emailValue = emailInput.value.trim();
    if (emailValue === '') {
        emailError.textContent = 'Por favor, preencha seu e-mail.';
        emailError.style.display = 'inline-block'; 
        emailInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            emailError.textContent = 'Formato de e-mail inválido.';
            emailError.style.display = 'inline-block';
            emailInput.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            emailError.style.display = 'none';
            emailInput.style.borderColor = '#ddd';
        }
    }
    
    // Validação do CPF
    const cpfValue = cpfInput.value;
    if (cpfValue === '' || cpfValue.replace(/[^\d]+/g, '').length === 0) { // Verifica se está vazio ou só tem máscara
        cpfError.textContent = 'Por favor, preencha seu CPF.';
        cpfError.style.display = 'inline-block';
        cpfInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else if (!validarCPF(cpfValue)) { 
        cpfError.textContent = 'CPF inválido. Verifique os dígitos.';
        cpfError.style.display = 'inline-block';
        cpfInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        cpfError.style.display = 'none';
        cpfInput.style.borderColor = '#ddd';
    }

    // Validação do Telefone
    if (telefoneInput.value.trim() === '') {
        telefoneError.textContent = 'Por favor, preencha seu telefone.';
        telefoneError.style.display = 'inline-block';
        telefoneInput.style.borderColor = '#e74c3c';
        isValid = false;
    } else {
        telefoneError.style.display = 'none';
        telefoneInput.style.borderColor = '#ddd';
    }
    // Fim das validações

    if (isValid) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;

        const formData = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            cpf: cpfInput.value, // O Formspree receberá formatado
            telefone: telefoneInput.value.trim(),
            _subject: `Novo Cadastro de: ${nomeInput.value.trim()}`, // Assunto do e-mail que você receberá
            // _replyto: emailInput.value.trim() // Define o "Responder Para" no e-mail
        };

        fetch(form.action, { // Usa o 'action' do formulário HTML
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Importante para o Formspree responder com JSON
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Ou apenas response se não precisar do corpo da resposta
            } else {
                // Tenta obter detalhes do erro do Formspree
                return response.json().then(data => {
                    let errorMessage = 'Falha ao enviar o formulário.';
                    if (data && data.errors && data.errors.length > 0) {
                        errorMessage = data.errors.map(err => err.message || err.field || String(err)).join(', ');
                    } else if (response.statusText) {
                        errorMessage = response.statusText;
                    }
                    throw new Error(errorMessage);
                });
            }
        })
        .then(data => {
            alert('Cadastro enviado com sucesso!');
            console.log('Sucesso com Formspree:', data);
            form.reset(); // Limpa o formulário
            // Resetar bordas e mensagens de erro visuais
            const inputs = [nomeInput, emailInput, cpfInput, telefoneInput];
            const errorMessages = [nomeError, emailError, cpfError, telefoneError];
            inputs.forEach(input => input.style.borderColor = '#ddd');
            errorMessages.forEach(msg => msg.style.display = 'none');
        })
        .catch(error => {
            console.error('Erro ao enviar para o Formspree:', error);
            alert('Erro ao enviar cadastro: ' + error.message);
        })
        .finally(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });

    } else {
        console.log('Formulário com erros. Não enviado.');
    }
});

// Função clearErrorOnChange (ajustada)
function clearErrorOnChange(inputElement, errorElement) {
    inputElement.addEventListener('input', function() {
        // Limpa o erro específico apenas se o campo não estiver vazio
        // A validação de "vazio" acontece no submit
        // Para o CPF, a máscara já dá feedback, e a validação final é no submit.
        if (inputElement.value.trim() !== '') {
            // Não limpa imediatamente o erro de "CPF inválido" apenas digitando
            if (inputElement.id === 'cpf' && errorElement.textContent.includes('inválido')) {
                // não faz nada, deixa a validação para o submit
            } else {
                errorElement.style.display = 'none';
                errorElement.textContent = ''; // Limpa o texto do erro
                inputElement.style.borderColor = '#ddd';
            }
        }
        // Se o campo for completamente esvaziado, remove a mensagem de erro
        if (inputElement.value.trim() === '') {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
            inputElement.style.borderColor = '#ddd';
        }
    });
}

clearErrorOnChange(nomeInput, nomeError);
clearErrorOnChange(emailInput, emailError);
clearErrorOnChange(cpfInput, cpfError); // Agora lida com o erro de "inválido" de forma mais sutil
clearErrorOnChange(telefoneInput, telefoneError);

// Limpar erro do CPF se o campo for esvaziado (mantido por segurança)
cpfInput.addEventListener('blur', function() { // Mudei para 'blur' para limpar após sair do campo se vazio
    if (cpfInput.value.replace(/[^\d]+/g, '') === '') { // Verifica se só tem máscara ou está vazio
        cpfError.style.display = 'none';
        cpfError.textContent = '';
        cpfInput.style.borderColor = '#ddd';
    }
});