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

// returns the current date in ISO format
// used for indexing into db
const get_current_date = () => {
   let d = new Date()
   return d.toISOString().slice(0, 10)
}

// returns age in years of user
const get_user_age_uid = async (uid) => {
   return new Date(new Date() - new Date((await get_user_data(uid)).userData.birthday)).getFullYear() - 1970
}

const get_user_age = (birthday) => {
   return new Date(new Date() - new Date(birthday)).getFullYear() - 1970
}

// returns health data based on day if exists, otherwise undefined
const get_health_data = async (uid) => {
   let all_data = await fb.get_doc('data', uid)
   let current_date = get_current_date()
   if (Object.keys(all_data).includes(current_date)) {
      let data = all_data[current_date]
      if (!Object.hasOwn(data, "water")) data.water = 0
      if (!Object.hasOwn(data, "journal")) data.journal = ""
      if (!Object.hasOwn(data, "sleep")) data.sleep = 0
      if (!Object.hasOwn(data, "exercise")) data.exercise = 0

      return data
   }
   return undefined
}

// standardizes gender for use as a key in firebase
const gender_to_key = (gender) => {
   switch (gender) {
      default: return "male"; break
      case "Male": return "male"; break
      case "Female": return "female"; break
      case "Non-Binary": return "non-binary"; break
   }
}

// gets an age category to use as a key from number age
// returns one of the following: child, teen, young adult, adult, elderly
const age_to_key = (age) => {
   if (age < 12) return "child"
   else if (age <= 17) return "teen"
   else if (age <= 29) return "youngadult"
   else if (age <= 64) return "adult"
   else return "elderly"
}

// given a user's age & gender, return their recommended amonut of some category
// age: some int age
// gender: either [Male, Female, Non-Binary] (case sensitive)
// category: either [sleep, exercise, water]
const get_recommended_amount_of = async (age, gender, category) => {
   if (!isNumber(age) || isNaN(age)) return [-1, -1]
   if (!["Male", "Female", "Non-Binary"].includes(gender)) return [-1, -1]
   if (!["sleep", "exercise", "water"].includes(category)) return [-1, -1]
   return (await fb.get_doc("recommendations", age_to_key(age)))[gender_to_key(gender)][category]
}

/* given health & user data, returns a filled prompt to go straight into gemini
 * health data looks like this:
 * {
 *    exercise: 2.2,
 *    sleep: 8.4,
 *    water: 20,
 *    journal: "Today I felt like..."
 * }
 * 
 * user data looks like this:
 * {
 *    birthday: "2002-03-26",
 *    gender: "Male",
 *    height: 1,
 *    weight: 100000
 * }
 * 
 * We can get the age with get_user_age(), passing in the birthday
 */

const get_filled_prompt = async (health_data, user_data) => {
   let age = get_user_age(user_data.birthday)
   // TODO put working prompt here
   // EXAMPLE:
   return `List out mental and physical health advice for a ${age} year old ${user_data.gender} individual. Today, they drank about ${health_data.water} oz of water, ...`
   // also once the health db is created, we can do something like "they drank X oz of water when its recommended they drink Y oz"
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
      })
      // initialize their data
      fb.set_doc("data", user_packet.uid, {
         [get_current_date()]: {
            water: 0,
            sleep: 0,
            exercise: 0,
            journal: ""
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

      if (await users.updateWaterIntake(uid, intake, get_current_date()) == -1) {
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

      if (await users.updateSleepHours(uid, hours, get_current_date()) == -1) {
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

      if (await users.updateExerciseHours(uid, hours, get_current_date()) == -1) {
         res.status(400).json({ message: "Server error: Couldn't update exercise amount." })
      } else {
         res.status(200).json({ message: "Exercise amount successfully updated!" })
      }
   } catch(e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request" })
   }
}

const update_user_journal = async (req, res) => {
   try {
      let token = req.body.token
      let journal = req.body.data.toString()
      let uid = await get_user_id(token)

      if (uid == -1) {
         return res.status(400).json({ message: "Invalid user session. Try logging in again." })
      } else if (journal == "") {
         return res.status(400).json({ message: "Invalid journal entry" })
      }

      if (await users.updateJournal(uid, journal, get_current_date()) == -1) {
         res.status(400).json({ message: "Server error: Couldn't update journal." })
      } else {
         res.status(200).json({ message: "Journal amount successfully updated!" })
      }
   } catch(e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request" })
   }
}

const get_advice = async (req, res) => {
   try {
      let token = req.body.token
      let uid = await get_user_id(token)

      if (uid == -1) {
         return res.status(400).json({ message: "Invalid user session. Try logging in again." })
      }
      
      let health_data = await get_health_data(uid)
      let user_data = await get_user_data(uid)
 
      if (!Object.hasOwn(user_data, "userData")) {
         return res.status(400).json({ message: "User account not set up!" })
      }

      user_data = user_data.userData

      if (health_data == undefined) {
         return res.status(400).json({ message: "No health data for today!" })
      } else if (health_data.journal == undefined || health_data.journal == "") {
         return res.status(400).json({ message: "No journal entry for today!" })
      }

      let prompt = get_filled_prompt(health_data, user_data)

      // TODO: pass prompt into gemini, await output, then send it back to the user. 
      // for the json response body, keep the message entry like before, but include 
      // a "advice" attribute containing gemini's advice
   } catch(e) {
      log("Error: " + e)
      res.status(400).json({ message: "Invalid or malformed request", advice: "Invalid" })
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
app.post("/update_journal", update_user_journal)
app.post("/get_advice", get_advice)

app.get("/", (req, res) => {
   res.writeHead(200, { "Content-Type": "text/html" })

   res.write("<pre>In Development</pre>");
   res.end();
})

module.exports = {
   start
}
