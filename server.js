const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { users: [], packs: [], comments: [], requests: [] };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { users: [], packs: [], comments: [], requests: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- USUÁRIOS ---
app.post('/api/register', (req, res) => {
    const { name, email, pass } = req.body;
    const data = readData();
    if (data.users.find(u => u.email === email)) return res.status(400).json({ error: "E-mail já cadastrado!" });
    data.users.push({ name, email, pass });
    writeData(data);
    res.json({ message: "Registrado com sucesso!" });
});

app.post('/api/login', (req, res) => {
    const { email, pass } = req.body;
    const data = readData();
    const ADMINS = [
        { email: "teste", pass: "1234" }, 
        { email: "djjp077@gmail.com", pass: "rodolfoo12@@" }, 
        { email: "lipedazn1@gmail.com", pass: "1234" }
    ];
    const isAdmin = ADMINS.find(a => a.email === email && a.pass === pass);
    const isUser = data.users.find(u => u.email === email && u.pass === pass);
    if (isAdmin) return res.json({ role: 'admin', name: 'Administrador', email });
    if (isUser) return res.json({ role: 'user', name: isUser.name, email });
    res.status(401).json({ error: "Dados incorretos!" });
});

// --- PACKS ---
app.get('/api/packs', (req, res) => res.json(readData().packs));
app.post('/api/packs', (req, res) => {
    const { name, link, category, uploader } = req.body;
    const data = readData();
    const newPack = { id: Date.now(), name, link, category, uploader };
    data.packs.push(newPack);
    writeData(data);
    res.json(newPack);
});
app.delete('/api/packs/:id', (req, res) => {
    const data = readData();
    data.packs = data.packs.filter(p => p.id != req.params.id);
    writeData(data);
    res.json({ message: "Removido!" });
});

// --- SOLICITAÇÕES ---
app.get('/api/requests', (req, res) => res.json(readData().requests || []));
app.post('/api/requests', (req, res) => {
    const { name, link } = req.body;
    const data = readData();
    if (!data.requests) data.requests = [];
    const newRequest = { id: Date.now(), name, link };
    data.requests.push(newRequest);
    writeData(data);
    res.json(newRequest);
});
app.delete('/api/requests/:id', (req, res) => {
    const data = readData();
    if (data.requests) data.requests = data.requests.filter(r => r.id != req.params.id);
    writeData(data);
    res.json({ message: "Processado!" });
});

// --- COMENTÁRIOS ---
app.get('/api/comments', (req, res) => res.json(readData().comments));
app.post('/api/comments', (req, res) => {
    const { user, text } = req.body;
    const data = readData();
    const comment = { id: Date.now(), user, text, date: new Date().toLocaleString('pt-BR') };
    data.comments.push(comment);
    writeData(data);
    res.json(comment);
});

// NOVA ROTA: Deletar Comentário (Exclusivo para Admin)
app.delete('/api/comments/:id', (req, res) => {
    const data = readData();
    data.comments = data.comments.filter(c => c.id != req.params.id);
    writeData(data);
    res.json({ message: "Comentário removido!" });
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
