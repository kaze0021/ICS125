const { log } = require("./utils.js")
const fb = require("./firebase.js") 

const PORT = process.env.port | 3000

const server = require("http").createServer((req, res) => {
   res.writeHead(200, { "Content-Type": "text/html" })

   res.write("<pre>In Development</pre>");
   res.end();
})

const start = () => {
   server.listen(PORT, () => {
      log("Server has started.")
   })
}

module.exports = {
   start
}
