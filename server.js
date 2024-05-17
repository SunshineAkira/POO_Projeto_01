const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para receber os dados do formulário e criar o arquivo de registro
app.post('/registro', express.urlencoded({ extended: true }), (req, res) => {
    const { nome, acao } = req.body;

    // Verifica se pelo menos uma ação foi selecionada
    if (!acao) {
        return res.status(400).send('Por favor, selecione Entrada e/ou Saída.');
    }

    // Verifica se o campo de nome está preenchido
    if (!nome.trim()) {
        return res.status(400).send('Por favor, preencha o campo Nome.');
    }

    // Cria a data e hora atual no formato DD/MM/AAAA HH:MM:SS
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0'); // +1 porque os meses são zero indexados
    const ano = now.getFullYear();
    const hora = String(now.getHours()).padStart(2, '0');
    const minutos = String(now.getMinutes()).padStart(2, '0');
    const segundos = String(now.getSeconds()).padStart(2, '0');
    const dataHora = `${dia}/${mes}/${ano} - ${hora}:${minutos}:${segundos}`;

    // Cria o conteúdo do arquivo de texto
    const conteudoArquivo = `Nome: ${nome}\nData e Hora: ${dataHora}\nAção: ${acao}`;

    // Define o diretório de registros
    const registrosDir = path.join(__dirname, 'registros');

    // Verifica se o diretório de registros existe, senão cria
    if (!fs.existsSync(registrosDir)) {
        fs.mkdirSync(registrosDir);
    }

    // Define o nome do arquivo com base na data atual
    const nomeArquivo = `registro_${Date.now()}.txt`;

    // Caminho completo para o arquivo de texto
    const caminhoArquivo = path.join(registrosDir, nomeArquivo);

    // Escreve o arquivo de texto
    fs.writeFile(caminhoArquivo, conteudoArquivo, (err) => {
        if (err) {
            console.error('Erro ao criar o arquivo de registro:', err);
            return res.status(500).send('Erro interno do servidor');
        } else {
            console.log('Arquivo de registro criado com sucesso:', nomeArquivo);
            // Redireciona para a página de impressão com os parâmetros na URL
            res.redirect(`/impressao?nome=${encodeURIComponent(nome)}&dataHora=${encodeURIComponent(dataHora)}&acao=${encodeURIComponent(acao)}`);
        }
    });
});

// Rota para a página de impressão
app.get('/impressao', (req, res) => {
    const { nome, dataHora, acao } = req.query;
    res.render('impressao', { nome, dataHora, acao });
});

// Configuração da porta do servidor
const PORT = process.env.PORT || 1409;
app.listen(PORT, () => {
    console.log(`Servidor executando em: http://localhost:${PORT}`);
});
