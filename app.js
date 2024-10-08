const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql'); // Pacote para SQL Server
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados
const dbConfig = {
    user: 'sa', // Substitua pelo seu usuário do SQL Server
    password: 'S@geBr.2014', // Substitua pela sua senha do SQL Server
    server: 'localhost', // Substitua pelo seu servidor SQL
    database: 'sistema', // Substitua pelo nome do seu banco de dados
    options: {
        encrypt: true, // Use true se estiver usando Azure
        trustServerCertificate: true // Para evitar problemas com certificados
    }
};

// Conectando ao banco de dados
sql.connect(dbConfig)
    .then(pool => {
        if (pool.connected) {
            console.log('Conectado ao banco de dados!');

            // Rota de login
            app.post('/api/login', async (req, res) => {
                const { usuario, senha } = req.body;

                // Consulta para verificar usuário e senha
                const query = 'SELECT * FROM usuarios WHERE login = @usuario AND senha = @senha';
                try {
                    const result = await pool.request()
                        .input('usuario', sql.VarChar, usuario)
                        .input('senha', sql.VarChar, senha)
                        .query(query);
                    
                    if (result.recordset.length > 0) {
                        return res.json({ message: 'Login bem-sucedido!' });
                    } else {
                        return res.status(401).json({ message: 'Usuário ou senha inválidos' });
                    }
                } catch (err) {
                    console.error('Erro na consulta:', err);
                    return res.status(500).json({ message: 'Erro ao consultar o banco de dados', error: err.message });
                }
            });
        }
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
        // Adicione uma resposta para indicar falha na conexão, se desejado
        app.use((req, res, next) => {
            res.status(500).json({ message: 'Falha ao conectar ao banco de dados', error: err.message });
        });
    });

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
