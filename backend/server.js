const { log } = require("./utils.js")
const fb = require("./firebase.js")

const PORT = process.env.port | 3000

const app = require("express")()
const server = require("http").createServer(app)
const cors = require("cors")
const body_parser = require("body-parser")

app.use(cors({ origin: "*" })) // accept from all origins for now, on prod change to specific URLs!
app.use(body_parser.json())

// set up req here

app.get("/", (req, res) => {
   res.writeHead(200, { "Content-Type": "text/html" })

   res.write("<pre>In Development</pre>");
   res.end();
})

const start = () => {
   server.listen(PORT, async () => {
      log("Server has started on port " + PORT)
   })
}

module.exports = {
   start
}
