# Users & the User Database
We use Firebase for user authentication and the health/user databases. 

## Process
When users sign up, they are registered with Firebase authentication, which generates a new unique user identification number or `uid`.

Several new documents in our databases are also created. First, users recieve a user data document in the `users` collection with basic user information. They also start a document in the `data` collection which contains a list of their daily inputs.

We can utilize Firebase rules to ensure only properly authenticated users can access the data that only they own, not anyone elses. Collections are indexed by uid, and we have configured Firebase to only allow users logged in with a certain uid to read/write documents of their uid.

## Schema Overview
We have 4 separate collections:
- Recommendations: a database of recommended levels of exercise, sleep, & water intake aggregated from numerous web sources and indexable by age & gender
- Sessions: records active user sessions by corroborating access tokens with user ids
- Users: stores lasting user data like their personal information & email
- Data: for each user, stores one entry per day of inputted information

### Recommendations
Compiled from various web sources such as posts from organizations like the CDC or health websites, this static repository contains recommended amounts of water, sleep, and exercise depending on age & gender. It is indexable with those and returns a range in the form of an array: `[minimum_amount, maximum_amount]`. Errors will return `[-1, -1]`

The first index required is the **age category**, which MUST be one of the following (case sensitive): `[child, teen, youngadult, adult, elderly]`. These correspond to the following age ranes (inclusive): 0-12, 13-17, 18-29, 30-64, 65+.

Next, we must index by **gender**, which MUST be (case sensitive) `[male, female, nonbinary]`. 

Finally, we can index by the **category** we are getting a reccomendation for, which must be one of `[sleep, water, exercise]`. The sleep & exercise is stored in hours, and the water is stored in fluid ounces.

Layout:
```python
recommendations -> <age category> -> <gender> -> <category>
```

Example:
```python
recommendations -> youngadult -> female -> sleep 
```
The above query would return `[8, 11]`, meaning a female young adult should be sleeping around 8-11 hours per night.

### Sessions
In the `sessions` collection, each document acts as a key that corresponds to a valid access token. Users can only access their own access tokens as dicated by the server & firebase rules. The document has a `uid` field that corresponds to the user's UID. This is used for indexing into the `users` collection.

Example:

```python
sessions -> <session access token> -> {
   uid: "<user uid from firebase>"
}
```

### Users
The `users` collection contains one document named by the `uid` for each user. When a user first signs up, their document doesn't contain much data. They need to complete an additional step, the `set_user_data` step to fully initialize their profile. This MUST be completed.

Example:
```python
users -> <uid> -> {
   email: "<user email>",
   uid: "<uid>",
   userData: {
      birthday: "1900-03-23",
      gender: "Male",
      height: 4.2,
      weight: 120
   }
}
```

### Data
The `data` collection holds all daily inputted information from all users, with one document for each user indexed by `uid`. The document contains numerous fields indexed by the ISO date, with each field being a map containing the daily exercise amount, sleep amount, water intake, and journal for the day.

Example:
```python
data -> <uid> -> {
   "2024-03-12": { ... },
   "2024-03-13": { ... },
   "2024-03-14": {
      exercise: 2,
      sleep: 8.3,
      water: 20,
      journal: "I had a final today and felt very stressed..."
   }
}
```

# Lifestyle Scoring
In order to obtain a lifestyle score, we can use the recommended goals for water intake, sleep, and exercise for each user based on their height, weight, gender, and age.

With that in mind, we can see how close they get to the recommended amounts, averaging their metrics for up to a 14 days ago. We chose to cap it at 14 days as we felt 2 weeks was ample time for consistent habits to show benefits but short enough that previous bad habits wouldn't linger and negatively affect the score.

We can then weight these sub-scores based on importance. For our algorithm we chose to have sleep equate to about 50% of the score, water intake 35%, and exercies 15%.

Once the calculations are complete, a score between 0.15 and 1.0 is returned, where higher values denote better daily habits and lower scores highlight the need for healthier goals.

See below for how to obtain a lifestyle score with an HTTP request.

# POST requests
Note that most requests will return a status (successful: 200, error: 400, etc) alongside a JSON body with a string called `message` highlighting the success/error.

Example usage:
```javascript
try {
   let response = await (await fetch(url + "/update_water", {
      method: "POST",
      headers: { ... },
      body: JSON.stringify({
         token: access_token,
         data: water
      })
   })).json()

   // success
   alert(response.message)
} catch (e) {
   // error
   console.log(e.response.message)
}
```

## `/signup`
### JSON Body Requirements:
- `email`: string for a valid email address
- `password`: string for a password

### Usage
Given a valid email & password combination, attempts to sign up as as firebase user. Use error handling (ie `try/catch`) to handle responses.

Returns a login message & firebase access token on successful signup. The access token should be stored in the client & passed for all requests for identification in the backend.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message
- `accessToken`: string firebase access token

## `/login`
### JSON Body Requirements:
- `email`: string for a valid email address
- `password`: string for a password

### Usage
Given a valid email & password combination, attempts to sign in.

Returns a login message & firebase access token on successful signup. Again, the access token should be stored in the client & passed for all requests for identification in the backend.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message
- `accessToken`: string firebase access token

## `/set_user_data`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup
- `birthday`: string for a valid ISO date (format `YYYY-MM-DD`)
- `gender`: string. Must be `[Male, Female, Non-Binary]` (case sensitive)
- `weight`: float weight in pounds (ex `163`)
- `height`: float height in feet (ex `5.87`)

### Usage
Given user fields, updates data in user database. Intended for use on signup (after signing up for the first time, user initializes their profile with basic data)

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/update_water`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup
- `data`: float for water intake in ounces

### Usage
Updates water usage in user data.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/update_exercise`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup
- `data`: float for exercise amount in hours

### Usage
Updates water usage for the day.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/update_sleep`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup
- `data`: float for sleep amount in hours

### Usage
Updates water usage for the day.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/set_journal`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup
- `data`: string journal entry for the day

### Usage
Updates user's journal entry for the day.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/get_advice`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup

### Usage
Once the user has inputted all of their daily data (especially the journal), the client makes a POST request to `/get_advice` to get back personalized advice from Gemini.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message
- `advice`: string message of advice from Gemini

## `/get_lifestyle_score`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup

### Usage
Averages user metrics for up to 14 days in the past, comparing them to their recommended values based on personal data to obtain a single score from 0.15 to 1.0 inclusive.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message
- `score`: a float score
