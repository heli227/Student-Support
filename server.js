const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const DATA_FILE = path.join(__dirname, 'shared-data.json');

app.use(express.json());

// 获取数据
app.get('/api/data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.json({});
        res.json(JSON.parse(data));
    });
});

// 保存数据
app.post('/api/data', (req, res) => {
    fs.writeFile(DATA_FILE, JSON.stringify(req.body), err => {
        if (err) return res.status(500).json({ error: '保存失败' });
        // 通知所有WebSocket客户端有新数据
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'update', data: req.body }));
            }
        });
        res.json({ success: true });
    });
});

// WebSocket实时同步
wss.on('connection', ws => {
    ws.on('message', message => {
        // 可扩展：处理客户端发来的消息
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});