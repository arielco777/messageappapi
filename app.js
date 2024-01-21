const express = require("express");
const cors = require("cors");
// const mysql = require("mysql2");
// const bcrypt = require("bcrypt");
const WebSocket = require("ws");
const http = require("http");

const PORT = 3001;
const app = express();
// const userTable = "users";
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// const apiw = "b1db1896338c8c8c789ee5d39c3ac43a";
// app.get("/weather", async (req, res) => {
//     const response = await fetch(
//         `http://api.weatherstack.com/current?access_key=${apiw}&query=Montreal&units=m`
//     );
//     const data = await response.json();
//     console.log(data);
//     res.json({ current: data.current });
// });

// app.get("/", (req, res) => {
//     try {
//         req.pool.query(
//             `CREATE TABLE IF NOT EXISTS ${userTable}(
//                 username VARCHAR(255) NOT NULL,
//                 password VARCHAR(255) NOT NULL,
//                 first_name VARCHAR(255),
//                 last_name VARCHAR(255),
//                 email VARCHAR(255),
//                 PRIMARY KEY (username))`,
//             [],
//             (error, results, fields) => {
//                 if (error) {
//                     console.error("Error creating table:", error);
//                     res.status(500).json({
//                         message: "Error creating table",
//                     });
//                     return; // Return here to prevent further execution
//                 }
//                 res.json({ message: "All Good" });
//             }
//         );
//     } catch (error) {
//         console.error("Error Starting Table Creation: ", error);
//         res.status(500).json({
//             message: "Error starting table creation",
//         });
//     }
// });

// app.post("/create", async (req, res) => {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//         req.pool.query(
//             `INSERT INTO ${userTable} (username, password) VALUES (?, ?)`,
//             [username, hashedPassword],
//             (error, results, fields) => {
//                 if (error) {
//                     res.status(500).json({
//                         message: "Error while processing the request.",
//                     });
//                     throw new Error(error);
//                 } else {
//                     res.json({ message: "Data inserted successfully!" });
//                 }
//             }
//         );
//     } catch (error) {
//         console.error("Error creating user: ", error);
//     }
// });

// app.post("/login", async (req, res) => {
//     const { username, password } = req.body;
//     req.pool.query(
//         `SELECT password FROM ${userTable} WHERE username = ?`,
//         [username],
//         async (error, results, fields) => {
//             if (error) {
//                 console.error("MySQL error:", error);
//                 res.status(500).json({
//                     message: "Error while processing the request.",
//                 });
//             } else {
//                 if (results.length > 0) {
//                     const hashedPasswordFromDatabase = results[0].password;

//                     const isPasswordMatch = await bcrypt.compare(
//                         password,
//                         hashedPasswordFromDatabase
//                     );

//                     if (isPasswordMatch) {
//                         res.json({ message: "Login successful" });
//                     } else {
//                         res.status(401).json({
//                             message: "Invalid credentials",
//                         });
//                     }
//                 } else {
//                     res.status(404).json({ message: "User not found" });
//                 }
//             }
//         }
//     );
// });

// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "csquared22",
//     database: "testuser",
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });

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

app.post("/messaging", async (req, res) => {
    const { who, message } = req.body;
    idx++;
    console.log("Who: ", who);
    console.log("Message: ", message);
    console.log("Idx: ", idx);
    messageHistory.push({
        idx,
        who,
        message,
    });
    res.json(messageHistory);
});

app.get("/messaging", (req, res) => {
    res.json(messageHistory);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});
