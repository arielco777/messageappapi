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

const maxMessages = 30;
const messageHistory = [];
let idx = 0;

wss.on("connection", (ws) => {
    ws.send(JSON.stringify(messageHistory));
    ws.on("message", (message) => {
        const newMessage = JSON.parse(message);
        addMessage(newMessage);
        // messageHistory.push(newMessage);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageHistory));
            }
        });
    });
});

function addMessage(newMessage) {
    idx++;
    messageHistory.push({
        idx,
        ...newMessage,
    });
    if (messageHistory.length > maxMessages) {
        // console.log("Shifting...");
        messageHistory.shift();
    }
    // console.log("Message History: ", messageHistory);
}

// app.post("/messaging", async (req, res) => {
//     console.error("Adding");
//     const { who, message } = req.body;

//     res.json(messageHistory);
// });

app.get("/messaging", (req, res) => {
    res.json(messageHistory);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});
