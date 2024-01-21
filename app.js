const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");

const PORT = 3001;
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const corsOptions = {
    origin: [
        "https://messagingapp-olive.vercel.app/messaging",
        "http://localhost:3000",
    ],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const maxMessages = 20;
const messageHistory = [];
let idx = 0;

wss.on("connection", (ws) => {
    ws.send(JSON.stringify(messageHistory));
    ws.on("message", (message) => {
        const newMessage = JSON.parse(message);
        messageHistory.push(newMessage);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageHistory));
            }
        });
    });
});

function addMessage(who, message) {
    idx++;
    messageHistory.push({
        idx,
        who,
        message,
    });
    while (messageHistory.length > maxMessages) {
        messageHistory.shift(); // Remove the oldest message
    }
}

app.post("/messaging", async (req, res) => {
    const { who, message } = req.body;
    idx++;
    addMessage(who, message);
    res.json(messageHistory);
});

app.get("/messaging", (req, res) => {
    res.json(messageHistory);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});
