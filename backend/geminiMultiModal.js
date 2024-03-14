/*
Generate responses with text, image, and video input. 
*/

const { openFile } = require("macos-open-file-dialog"); // Mac only for now
const fs = require("fs").promises;
const readline = require("readline").createInterface({ //configure console readline
    input: process.stdin,
    output: process.stdout,
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const dotenv = require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
}

// Take a file and return a base64 string
async function getFileAsBase64(filePath) {
    const fileData = await fs.readFile(filePath);
    return fileData.toString("base64");
}

// List of file types you want to allow a user to upload to Gemini
const allowedTypes = [
    "public.png",
    "public.jpeg",
    "public.jpg",
    "public.webp",
    "public.heic",
    "public.heif",
    "com.apple.quicktime-movie",
    "public.mpeg-4",
    "public.avi",
    "com.microsoft.windows-media-wmv",
    "public.mpeg",
];

// Get the MIME file type required by Gemini when passing files
function getMimeType(filePath) {
    const extensionToMimeType = {
        png: "image/png",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        webp: "image/webp",
        heic: "image/heic",
        heif: "image/heif",
        mov: "video/mov",
        mpeg: "video/mpeg",
        mp4: "video/mp4",
        mpg: "video/mpg",
        avi: "video/avi",
        wmv: "video/wmv",
        mpegps: "video/mpegps",
        flv: "video/flv",
    };

    const extension = filePath.split(".").pop().toLowerCase();
    return extensionToMimeType[extension] || null;
}

function askQuestion(question) {
    return new Promise((resolve) => {
        readline.question(question, (answer) => {
        resolve(answer.trim());
        });
    });
}

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const BYTE_LIMIT = 4194304; // 4 MB file limit from gemini
    let keepRunning = true;

    console.log(
        "\n/ // /// //// WELCOME TO YOUR MULTIMODAL GEMINI CHAT BOT //// /// // /\n\n"
    );

    while (keepRunning) {
        let filePath = "";
        const uploadChoice = await askQuestion("Do you want to upload a file with your question? (yes/no): ");

        let inputFilePath = null;

        // This will only work on macOS. 
        // If on windows use e.g. node-file-dialog package, or comment the if-statement below and hard-code the inputFilePath above to: let inputFilePath = "myFileName.png"
        if (uploadChoice.toLowerCase() === "yes") {
            // Adjust the method to obtain the file path according to your implementation
            inputFilePath = await openFile("Select a file", allowedTypes);
            if (inputFilePath) {
                const stats = await fs.stat(inputFilePath);
                if (stats.size > BYTE_LIMIT) { 
                    console.log("The file is too large for the Gemini API. Please select a file smaller than 4 MB.");
                }
            } else {
                console.log("No file selected.");
            }
        }

        // Ask the user what their question is
        const userQuestion = await askQuestion("\nWhat's your question? ");

        if (inputFilePath) {
            const mimeType = getMimeType(inputFilePath);
            const base64Data = await getFileAsBase64(inputFilePath); 
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType
                }
            };
            
            const result = await model.generateContent({contents: [{role: "user", parts: [imagePart, {text: userQuestion}]}]});
            
            const response = await result.response;
            const text = response.text();
            console.log(text);
        }

        const continueRunning = await askQuestion(
        "Do you have another question? (yes/no): "
        );
        keepRunning = continueRunning.toLowerCase() === "yes";
    }

    console.log("\nOk, have a great rest of your day!\n");
    readline.close();
}

run();