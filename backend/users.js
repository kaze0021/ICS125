const fb = require("./firebase.js")

/**
 * Both login & signup run on the server after a POST request for either is received.
 * Both need a string email & password in the request body
 */

const login = async (req, res) => {
   let user = {
      email: req.body.email,
      password: req.body.password
   }

   let user_packet = await fb.login(user.email, user.password)
   if (user_packet) {
      res.status(200).json({ message: "Login successful!" })
   } else {
      res.status(400).json({ message: "Couldn't login!" })
   }
}

const signup = async (req, res) => {
   let user = {
      email: req.body.email,
      password: req.body.password
   }

   let user_packet = await fb.signup(user.email, user.password)
   if (user_packet) {
      res.status(200).json({ message: "Login successful!" })
   } else {
      res.status(400).json({ message: "Couldn't login!" })
   }
}

module.exports = {
   login,
   signup
}