/*
Generate text from text-only input.
Create prompts in the terminal.
*/
const { GoogleGenerativeAI } = require("@google/generative-ai");

const dotenv = require("dotenv")
dotenv.config()

const readline = require("readline")
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

userInterface.prompt()

/* Node's built-in userInterface to interact with terminal.
Interact with continuous gemini prompts. After Gemini is done generating, type your next prompt + enter.
Does not have an exit option yet. Must use ctrl + c to exit prompt. 
*/
userInterface.on("line", async input => {
  console.log(
    "\n/ // /// //// WELCOME TO YOUR TEXT GEMINI CHAT BOT //// /// // /\n\n"
  );
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const result = await model.generateContentStream([input]);
  for await(const chunk of result.stream){
    const chunkText = chunk.text();
    console.log(chunkText)
  }

})
