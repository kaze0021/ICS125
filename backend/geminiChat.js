/*
Generate text from text-only input.
Create prompts in the terminal.

There are two possible options for role associated with the content in a conversation:
    user: the role which provides the prompts. This value is the default for sendMessage calls.

    model: the role which provides the responses. This role can be used when calling startChat() with existing history.
*/

const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const readline = require("readline");
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let keepRunning = true;

userInterface.setPrompt("You: "); // Set a clear prompt for user input

userInterface.on("line", async input => {
  if (input.toLowerCase() === "quit") { // Allow exiting with "quit"
    keepRunning = false;
    console.log("Goodbye! ");
    userInterface.close();
    return;
  }

  console.log("\nGemini: "); // Indicate Gemini's response

  try {
    const result = await model.generateContentStream([input]);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
    }
  } catch (error) {
    console.error("Error processing your request:", error.message);
  }

  // Prompt for the next input
  userInterface.prompt();
});

console.log(
  "\n/ // /// //// WELCOME TO YOUR TEXT GEMINI CHAT BOT //// /// // /\n\n"
);
userInterface.prompt(); // Start the conversation

/*
// Quickstart code from Gemini docs
async function run() {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "Hello, I have 2 dogs in my house.",
        },
        {
          role: "model",
          parts: "Great to meet you. What would you like to know?",
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
  
    const msg = "How many paws are in my house?";
  
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  }
  
  run();
  */