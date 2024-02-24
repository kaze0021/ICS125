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
      res.status(200).json({ message: "Login successful!", user_packet: user_packet })
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
      res.status(200).json({ message: "Signup successful!", user_packet: user_packet })

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

/**
 * Updates the water intake for a specific user.
 * @param {string} uid - The UID of the user.
 * @param {number} waterIntakeOz - The new water intake in ounces.
 */
const updateWaterIntake = async (uid, waterIntakeOz) => {
   try {
       await fb.update_doc('users', uid, {
           'healthData.waterIntakeOz': waterIntakeOz
       });
       console.log(`Water intake updated to ${waterIntakeOz}oz for user ${uid}`);
   } catch (error) {
       console.error(`Failed to update water intake for user ${uid}:`, error);
   }
}

/**
 * Updates the sleep hours for a specific user.
 * @param {string} uid - The UID of the user.
 * @param {number} sleepHours - The new sleep hours.
 */
const updateSleepHours = async (uid, sleepHours) => {
   try {
       await fb.update_doc('users', uid, {
           'healthData.sleepHours': sleepHours
       });
       console.log(`Sleep hours updated to ${sleepHours} hours for user ${uid}`);
   } catch (error) {
       console.error(`Failed to update sleep hours for user ${uid}:`, error);
   }
}

/**
 * Updates the exercise hours for a specific user.
 * @param {string} uid - The UID of the user.
 * @param {number} exerciseHours - The new exercise hours.
 */
const updateExerciseHours = async (uid, exerciseHours) => {
   try {
       await fb.update_doc('users', uid, {
           'healthData.exerciseHours': exerciseHours
       });
       console.log(`Exercise hours updated to ${exerciseHours} hours for user ${uid}`);
   } catch (error) {
       console.error(`Failed to update exercise hours for user ${uid}:`, error);
   }
}

module.exports = {
   login,
   signup,
   updateWaterIntake,
   updateSleepHours,
   updateExerciseHours
}
