const fb = require("./firebase.js")
const { log } = require("./utils.js")

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
       return 1;
   } catch (error) {
       console.error(`Failed to update water intake for user ${uid}:`, error);
       return -1;
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
       return 1;
      } catch (error) {
       console.error(`Failed to update sleep hours for user ${uid}:`, error);
       return -1;
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
       return 1;
      } catch (error) {
       console.error(`Failed to update exercise hours for user ${uid}:`, error);
       return -1;
   }
}

module.exports = {
   updateWaterIntake,
   updateSleepHours,
   updateExerciseHours
}
