const fb = require("./firebase.js")
const { log } = require("./utils.js")

/**
 * Updates the water intake for a specific user.
 * @param {string} uid - The UID of the user.
 * @param {number} waterIntakeOz - The new water intake in ounces.
 */
const updateWaterIntake = async (uid, waterIntakeOz, date) => {
    try {
        let data = (await fb.get_doc('data', uid))[date]
        data.water = waterIntakeOz
        await fb.update_doc('data', uid, {
            [date]: data
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
const updateSleepHours = async (uid, sleepHours, date) => {
   try {
        let data = (await fb.get_doc('data', uid))[date]
        data.sleep = sleepHours
        await fb.update_doc('data', uid, {
            [date]: data
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
const updateExerciseHours = async (uid, exerciseHours, date) => {
   try {
        let data = (await fb.get_doc('data', uid))[date]
        data.exercise = exerciseHours
        await fb.update_doc('data', uid, {
            [date]: data
        });
        console.log(`Exercise hours updated to ${exerciseHours} hours for user ${uid}`);
        return 1;
      } catch (error) {
        console.error(`Failed to update exercise hours for user ${uid}:`, error);
        return -1;
   }
}

/**
 * Updates the journal entry for a specific user.
 * @param {string} uid - The UID of the user.
 * @param {string} journal - The new journal entry
 */
const updateJournal = async (uid, journal, date) => {
    try {
        let data = (await fb.get_doc('data', uid))[date]
        data.journal = journal
        await fb.update_doc('data', uid, {
            [date]: data
        });
        console.log(`Journal updated for user ${uid}`);
        return 1;
       } catch (error) {
        console.error(`Failed to update journal for user ${uid}:`, error);
        return -1;
    }
 }

 /**
 * Updates the location for a specific user.
 * @param {string} uid - The UID of the user.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 */
 const updateLocation = async (uid, latitude, longitude) => {
    try {
        const userDoc = await fb.get_doc('users', uid); // Fetch the user's current data
        const userData = userDoc.userData || {}; // Safely access userData
        userData.location = { latitude, longitude, timestamp: new Date() }; // Update location within userData
        await fb.update_doc('users', uid, { userData }); // Set the updated userData back on the document
        console.log(`Location updated for user ${uid}: Lat ${latitude}, Lng ${longitude}`);
        return 1;
    } catch (error) {
        console.error(`Failed to update location for user ${uid}:`, error);
        return -1;
    }
};


module.exports = {
   updateWaterIntake,
   updateSleepHours,
   updateExerciseHours,
   updateJournal,
   updateLocation
}
