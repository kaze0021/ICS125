# Users & the User Database
We'll use Firebase for user authentication and the health/user databases. 

## Structure
When a user creates an account, a new document is generated in the `users` collection based on their firebase UID. This document starts out with very basic user information, and will grow as the user uses the app. For now, it contains only their email & UID. In the future, it may contain information like personalized health data or login frequency. We can utilize Firebase rules to ensure only properly authenticated users can access the data that only they own, not anyone elses.

## Schema Overview
We have 2 separate collections, one to record the valid running user sessions and one to record our user data.

### Sessions
In the `sessions` collection, each document acts as a key that corresponds to a valid access token. Users can only access their own access tokens as dicated by the server & firebase rules. The document has a `uid` field that corresponds to the user's UID. This is used for indexing into the `users` collection.

### Users
The `users` collection contains one document named by the `uid` for each user. When a user first signs up, their document doesn't contain much data:

```
email: "user_email@mail.com",
healthData: {
   exerciseHours: 0,
   sleepHours: 0,
   waterIntakeOz: 0
},
uid: "uid..."
```

Once they complete their full signup (adding their user data), we should also see a `userData` map containing information like their birthday, height, weight, and gender.

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
Updates water usage in user data.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/update_sleep`
### JSON Body Requirements:
- `token`: valid string access token for an existing user session. tokens are returned on a successful login/signup
- `data`: float for sleep amount in hours

### Usage
Updates water usage in user data.

### Response
Returns status `400` on error and `200` on success. JSON response body contains the following:
- `message`: string status message

## `/set_journal`
TODO

## `/get_advice`
TODO