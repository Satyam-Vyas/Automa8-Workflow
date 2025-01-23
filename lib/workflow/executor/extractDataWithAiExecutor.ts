import { ExecutionEnvironment } from "@/types/executor";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAi";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function ExtractDataWithAIExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
): Promise<boolean> {
    try {
        const credentials = environment.getInput("Credentials");
        if(!credentials) {
            environment.log.error("input->credentials not defined");
        }

        const prompt = environment.getInput("Prompt");
        if(!prompt) {
            environment.log.error("input->prompt not defined");
        }

        const content = environment.getInput("Content");
        if(!content) {
            environment.log.error("input->content not defined");
        }

        //GET credentials from DB
        const credential = await prisma.credential.findUnique({
            where: {
                id: credentials,
            }
        });

        if(!credential) {
            environment.log.error("credential not found");
            return false;
        }

        const plainCredentialValue = symmetricDecrypt(credential.value);
        if(!plainCredentialValue) {
            environment.log.error("credential value not found");
            return false;
        }

        const genAI = new GoogleGenerativeAI(plainCredentialValue);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
            systemInstruction: `You are a webscraper helper that extracts data from HTML or text.
            You will be given a piece of text or HTML content as input and also the prompt with the data you have to extract.
            The response should always be only the extracted data as a JSON array or object, without any additional words or explanations.
            Analyze the input carefully and extract data precisely based on the prompt. If no data is found, return an empty JSON array.
            Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text`,
        });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: content,
                    }],
                },
            ],
        });

        const result = await chat.sendMessage(prompt);
        let extractedData = result.response.text();
        extractedData = extractedData.replace(/^```json/, "").replace(/```/, "");

        environment.setOutput("Extracted data", extractedData);

        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}