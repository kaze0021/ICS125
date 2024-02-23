# Users & the User Database
We'll use Firebase for user authentication and the health/user databases. 

## Structure
When a user creates an account, a new document is generated in the `users` collection based on their firebase UID. This document starts out with very basic user information, and will grow as the user uses the app. For now, it contains only their email & UID. In the future, it may contain information like personalized health data or login frequency. We can utilize Firebase rules to ensure only properly authenticated users can access the data that only they own, not anyone elses.

## POST requests
Users can create accounts by passing a POST request with a JSON body to `.../signup`. The JSON body needs to have 2 strings, an `email` and `password`. Logging in is similar, with a POST request with the same body submitted to `.../login`. For now, some basic user information for login persistence is returned, but everything is subject to change. 