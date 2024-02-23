const fb = require("./firebase.js")
const { log } = require("./utils.js")

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
   if (!user_packet.error) {
      res.status(200).json({ message: "Login successful!" })
   } else {
      switch (user_packet.error) {
         case "auth/invalid-credential":
            res.status(400).json({ message: "Invalid email/password!" })
            break;
         default:
            res.status(400).json({ message: "Couldn't login!" })
            break;
      }
   }
}

const signup = async (req, res) => {
   let user = {
      email: req.body.email,
      password: req.body.password
   }

   let user_packet = await fb.signup(user.email, user.password)
   if (!user_packet.error) {
      res.status(200).json({ message: "Login successful!" })

      // for new users, generate basic data for them
      fb.set_doc("users", user_packet.uid, {
         email: user.email,
         uid: user_packet.uid,
      })
   } else {
      switch (user_packet.error) {
         case "auth/email-already-in-use":
            res.status(400).json({ message: "Account under that email already exists!" })
            break;
         default:
            res.status(400).json({ message: "Couldn't sign up!" })
            break;
      }
   }
}

module.exports = {
   login,
   signup
}