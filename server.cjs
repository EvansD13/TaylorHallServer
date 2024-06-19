const express = require("express")
const app = express()
const cors = require("cors")

app.get("/", (req, res) => res.send("Express"))
app.listen(3001, () => console.log("Server ready on port 3001"))

module.exports = app
g