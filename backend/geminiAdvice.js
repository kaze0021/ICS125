const { GoogleGenerativeAI } = require("@google/generative-ai");

const dotenv = require("dotenv");
dotenv.config();

async function generateText(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContentStream([prompt]);
  let generatedText = "";

  for await (const chunk of result.stream) {
    generatedText += chunk.text();
  }

  return generatedText;
}


module.exports = { generateText };
