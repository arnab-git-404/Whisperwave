import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const specialChar = "||";

export async function POST(req: Request) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const aiResponse = await model.generateContent(prompt);

    const response = aiResponse.response.text();

    // const candidateText = aiResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log(response);

    // return NextResponse.json({ response });
   const responseArray = response.split(specialChar);
    
 return new NextResponse(JSON.stringify(responseArray), {
  headers: {
    "Content-Type": "application/json",
  },
});

      // return new NextResponse(response, {
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // }


  } catch (AI_error) {
    if (AI_error instanceof GoogleGenerativeAIError) {
      const { name, message } = AI_error;
      return NextResponse.json({ name, message }, { status: 500 });
    } else {
      console.error("An Unexpected Error Occurred From AI API CAll", AI_error);
      throw AI_error;
    }
  }
}
