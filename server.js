// server.js
const express = require("express");
const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("Mensaje recibido:", req.body);
  res.send("OK");
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
