const { log } = require("./utils.js")
const users = require("./users.js")

const PORT = process.env.port | 3000

const app = require("express")()
const server = require("http").createServer(app)
const cors = require("cors")
const body_parser = require("body-parser")

const fb = require("./firebase.js")

const setup_user_sessions = () => {
   // firebase.delete_doc_path("sessions/users")
   // fb.set_doc_path("sessions/users", {})
   fb.delete_collection("sessions")
}

const start = async () => {
   server.listen(PORT, async () => {
      setup_user_sessions()
      log("Server has started on port " + PORT)

      await new_user_session("among us", "sdlfkjsldkfj")
      await get_user_id("among us")
   })
}

const new_user_session = async (token, uid) => {
   // create connection between token & user id in db
   await fb.set_doc("sessions", token, { uid: uid })
}

// given a session access token, returns the UID that corresponds to it, or -1 if no session exists
const get_user_id = async (token) => {
   let data = await fb.get_doc("sessions", token)
   return data ? data.uid : -1
}

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
      res.status(200).json({ message: "Login successful!", accessToken: user_packet.accessToken })
      new_user_session(user_packet.accessToken, user_packet.uid)
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
      res.status(200).json({ message: "Signup successful!", accessToken: user_packet.accessToken })
      new_user_session(user_packet.accessToken, user_packet.uid)

      // for new users, generate basic data for them
      fb.set_doc("users", user_packet.uid, {
         email: user.email,
         uid: user_packet.uid,
         healthData: {
            waterIntakeOz: 0,
            sleepHours: 0,
            exerciseHours: 0
         }
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

// given a session token & the updated intake in oz, updates in users db
// returns a status code, -1 for error and 1 for successful update
const update_user_water = async (req, res) => {
   let token = req.body.token;
   let intake = req.body.data;

   let uid = await get_user_id(token)

   if (uid == -1) {
      res.status(400).json({ message: "Invalid user session. Try logging in again." })
      return
   }

   if (await users.updateWaterIntake(uid, intake) == -1) {
      res.status(400).json({ message: "Server error: Couldn't update water intake." })
   } else {
      res.status(200).json({ message: "Water intake successfully updated!" })
   }
}

const update_user_sleep = async (req, res) => {
   let token = req.body.token;
   let hours = req.body.data;

   let uid = await get_user_id(token)

   if (uid == -1) {
      res.status(400).json({ message: "Invalid user session. Try logging in again." })
      return
   }

   if (await users.updateSleepHours(uid, hours) == -1) {
      res.status(400).json({ message: "Server error: Couldn't update sleep amount." })
   } else {
      res.status(200).json({ message: "Sleep amount successfully updated!" })
   }
}

const update_user_exercise = async (req, res) => {
   let token = req.body.token;
   let hours = req.body.data;

   let uid = await get_user_id(token)

   if (uid == -1) {
      res.status(400).json({ message: "Invalid user session. Try logging in again." })
      return
   }

   if (await users.updateExerciseHours(uid, hours) == -1) {
      res.status(400).json({ message: "Server error: Couldn't update exercise amount." })
   } else {
      res.status(200).json({ message: "Exercise amount successfully updated!" })
   }
}

app.use(cors({ origin: "*" })) // accept from all origins for now, on prod change to specific URLs!
app.use(body_parser.json())

// set up req here
app.post("/login", login)
app.post("/signup", signup)
app.post("/update_water", update_user_water)
app.post("/update_exercise", update_user_exercise)
app.post("/update_sleep", update_user_sleep)

app.get("/", (req, res) => {
   res.writeHead(200, { "Content-Type": "text/html" })

   res.write("<pre>In Development</pre>");
   res.end();
})

module.exports = {
   start
}
