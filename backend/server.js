const { log } = require("./utils.js")
const users = require("./users.js")

const PORT = process.env.port | 3000

const app = require("express")()
const server = require("http").createServer(app)
const cors = require("cors")
const body_parser = require("body-parser")

const fb = require("./firebase.js")

const isNumber = (n) => {
   return typeof n === 'number'
}

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
   try {
      let data = await fb.get_doc("sessions", token)
      return data ? data.uid : -1
   } catch (e) {
      return -1
   }
}

// gets age of user using their stored birthday
const get_user_data = async (uid) => {
   return await fb.get_doc("users", uid)
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

// sets the basic (mostly unchanging) data of our users
// all should be strings
// birthday shoudl be in ISO format: YYYY-MM-DD
// height is in feet
// weight is in lbs
// example of a 'proper' input:
//
// set_user_data("2002-02-18", "Male", 1.1, 1000)
const set_user_data = async (req, res) => {
   try {
      // check data
      let data = {
         birthday: req.body.birthday,
         gender: req.body.gender,
         height: parseFloat(req.body.height),
         weight: parseFloat(req.body.weight)
      }
      let uid = await get_user_id(req.body.token)

      // adapted from https://www.30secondsofcode.org/js/s/iso-format-date-with-timezone/
      const is_ISO_date = (v) => {
         const d = new Date(v);
         return !Number.isNaN(d.valueOf()) && d.toISOString().includes(v);
      };

      // todo move this to config class
      let valid_genders = [
         "Male", "Female", "Non-Binary"
      ]

      let keys = Object.keys(data)
      if (!keys.includes("birthday") ||
         !keys.includes("height") ||
         !keys.includes("weight") ||
         !keys.includes("gender")) {
         return res.status(400).json({ message: "Error: Invalid user data" })
      }

      // ensure is "valid" data
      if (!isNumber(data.height) || data.height < 0 || data.height > 10) {
         return res.status(400).json({ message: "Invalid height" })
      } else if (!isNumber(data.weight) || data.weight < 0) {
         return res.status(400).json({ message: "Invalid weight" })
      } else if (!valid_genders.includes(data.gender)) {
         return res.status(400).json({ message: "Invalid gender" })
      } else if (!is_ISO_date(data.birthday)) {
         return res.status(400).json({ message: "Invalid birthday" })
      }

      await fb.update_doc("users", uid, {
         userData: data
      })

      res.status(200).json({ message: "Successfully updated user data" })
   } catch (e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request" })
   }
}

// given a session token & the updated intake in oz, updates in users db
// returns a status code, -1 for error and 1 for successful update
const update_user_water = async (req, res) => {
   try {
      let token = req.body.token;
      let intake = parseFloat(req.body.data);

      if (isNaN(intake)) return res.status(400).json({ message: "Invalid amount" })

      let uid = await get_user_id(token)

      // error catching/handling
      if (uid == -1) {
         return res.status(400).json({ message: "Invalid user session. Try logging in again." })
      } else if (!isNumber(intake) || intake < 0) {
         return res.status(400).json({ message: "Invalid water amount" })
      }

      if (await users.updateWaterIntake(uid, intake) == -1) {
         res.status(400).json({ message: "Server error: Couldn't update water intake." })
      } else {
         res.status(200).json({ message: "Water intake successfully updated!" })
      }
   } catch(e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request" })
   }
}

const update_user_sleep = async (req, res) => {
   try {
      let token = req.body.token;
      let hours = parseFloat(req.body.data);

      if (isNaN(hours)) return res.status(400).json({ message: "Invalid amount" })

      let uid = await get_user_id(token)

      // error catching/handling
      if (uid == -1) {
         return res.status(400).json({ message: "Invalid user session. Try logging in again." })
      } else if (!isNumber(hours) || hours < 0) {
         return res.status(400).json({ message: "Invalid sleep amount" })
      }

      if (await users.updateSleepHours(uid, hours) == -1) {
         res.status(400).json({ message: "Server error: Couldn't update sleep amount." })
      } else {
         res.status(200).json({ message: "Sleep amount successfully updated!" })
      }
   } catch(e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request" })
   }
}

const update_user_exercise = async (req, res) => {
   try {
      let token = req.body.token;
      let hours = parseFloat(req.body.data);

      if (isNaN(hours)) return res.status(400).json({ message: "Invalid amount" })
      
      let uid = await get_user_id(token)

      // error catching/handling
      if (uid == -1) {
         return res.status(400).json({ message: "Invalid user session. Try logging in again." })
      } else if (!isNumber(hours) || hours < 0) {
         return res.status(400).json({ message: "Invalid exercise amount" })
      }

      if (await users.updateExerciseHours(uid, hours) == -1) {
         res.status(400).json({ message: "Server error: Couldn't update exercise amount." })
      } else {
         res.status(200).json({ message: "Exercise amount successfully updated!" })
      }
   } catch(e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request" })
   }
}

app.use(cors({ origin: "*" })) // accept from all origins for now, on prod change to specific URLs!
app.use(body_parser.json())

// set up req here
app.post("/login", login)
app.post("/signup", signup)
app.post("/set_user_data", set_user_data)
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
