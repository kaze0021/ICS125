# Mental Zots Backend
The `backend` directory contains the source for the Mental Zots web server, running on NodeJS. 

It functions as a basic REST http server. See [the server documentation](./server.md) for more information.

To get started:
```console
npm i
npm start
```

Visit http://localhost:3000 and you should see some output.

## Gemini API Basics 
How to use the Google Gemini API
*  Documentation: https://ai.google.dev/tutorials/node_quickstart#generate-text-from-text-input
### Steps to set up:
1. Get api key here (This can't be done with @uci.edu; use a personal account): https://ai.google.dev 
2. Create the .env file in this backend directory and store the api key in this format ```API_KEY = [paste your key]```
3. Activate text Gemini in console:
    ```console
    node gemini.js
    ```
4. You can start typing in prompts in the console continuously unti exit with ctr + c (for now).

**Note:**
There is also a multiModal version (text AND image), but is Mac only right now. You can hardcode the multimodal file paths to test it out: ```node geminiMultiModal.js```
