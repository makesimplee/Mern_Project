const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
console.log(
    "GEMINI API KEY LOADED:",
    !!process.env.GOOGLE_GENAI_API_KEY
);

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});


/*
|--------------------------------------------------------------------------
| Interview Report Schema
|--------------------------------------------------------------------------
*/

const interviewReportSchema = {
    type: "object",

    properties: {

        title: {
            type: "string",
            description:
                "The job title or role for which this interview report is generated"
        },

        matchScore: {
            type: "number",
            description:
                "A score from 0 to 100 indicating how well the candidate matches the job description"
        },

        technicalQuestions: {
            type: "array",
            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string"
                    },

                    intention: {
                        type: "string"
                    },

                    answer: {
                        type: "string"
                    }
                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",

                properties: {
                    question: {
                        type: "string"
                    },

                    intention: {
                        type: "string"
                    },

                    answer: {
                        type: "string"
                    }
                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        skillGaps: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    skill: {
                        type: "string"
                    },

                    severity: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high"
                        ]
                    }
                },

                required: [
                    "skill",
                    "severity"
                ]
            }
        },

        preparationPlan: {
            type: "array",

            items: {
                type: "object",

                properties: {
                    day: {
                        type: "integer"
                    },

                    focus: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },

                    task: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },

                required: [
                    "day",
                    "focus",
                    "task"
                ]
            }
        }
    },

    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"
    ]
};


/*
|--------------------------------------------------------------------------
| Gemini Request
|--------------------------------------------------------------------------
*/

async function generateWithRetry(prompt, config) {

    const maxRetries = 4;

    for (let attempt = 0; attempt < maxRetries; attempt++) {

        try {

            console.log(
                `Gemini request attempt ${attempt + 1}/${maxRetries}`
            );

            const response = await ai.models.generateContent({

                model: "gemini-3.8-flash",

                contents: prompt,

                config
            });

            console.log(
                "Gemini request successful."
            );

            return response;

        } catch (error) {

            console.error(
                `Gemini request failed on attempt ${attempt + 1}`
            );

            console.error(
                error?.message || error
            );

            const errorMessage =
                error?.message || "";

            const isTemporaryError =
                error?.status === 503 ||
                error?.code === 503 ||
                errorMessage.includes("503") ||
                errorMessage.includes("UNAVAILABLE") ||
                errorMessage.includes("high demand");

            /*
            |--------------------------------------------------------------------------
            | Non-temporary error
            |--------------------------------------------------------------------------
            */

            if (!isTemporaryError) {
                throw error;
            }

            /*
            |--------------------------------------------------------------------------
            | Last attempt
            |--------------------------------------------------------------------------
            */

            if (attempt === maxRetries - 1) {

                console.error(
                    "Gemini service is still unavailable after retries."
                );

                throw new Error(
                    "AI service is temporarily unavailable. Please try again later."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Exponential backoff
            |--------------------------------------------------------------------------
            */

            const delay =
                1000 * Math.pow(2, attempt);

            console.log(
                `Retrying Gemini request in ${delay / 1000} seconds...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );
        }
    }
}


/*
|--------------------------------------------------------------------------
| Generate Interview Report
|--------------------------------------------------------------------------
*/

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        console.log(
            "AI request started..."
        );

        const prompt = `
Generate an interview preparation report for the candidate.

Resume:
${resume}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}

Requirements:

1. Extract the main job title from the job description and return it as "title".

2. Calculate a match score between 0 and 100.

3. Generate exactly 5 technical interview questions.

Each technical question must contain:

- question
- intention
- answer

4. Generate exactly 5 behavioral interview questions.

Each behavioral question must contain:

- question
- intention
- answer

5. Identify the candidate's skill gaps.

Each skill gap must contain:

- skill
- severity

Severity must be one of:

"low"
"medium"
"high"

6. Create a 7-day preparation plan.

Each preparation plan item must contain:

- day
- focus
- task

focus must be an array of strings.

task must be an array of strings.

Return ONLY valid JSON matching the provided response schema.
`;


        const response = await generateWithRetry(
            prompt,
            {
                responseMimeType: "application/json",
                responseSchema: interviewReportSchema
            }
        );


        console.log(
            "AI response received."
        );


        const responseText =
            typeof response.text === "function"
                ? response.text()
                : response.text;


        console.log(
            "AI response text:"
        );

        console.log(
            responseText
        );


        const parsedData =
            JSON.parse(responseText);


        console.log(
            "AI report parsed successfully."
        );


        return parsedData;

    } catch (error) {

        console.error(
            "AI generation failed:"
        );

        console.error(
            error?.message || error
        );

        throw error;
    }
}



  //HTML to pdf generation
async function generatedPdfFromHtml(htmlContent) {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        return await page.pdf({
            format: "A4",
            printBackground: true
        });

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}


async function generateResumePdf({resume,selfDescription,jobDescription}){
    const resumePdfSchema=z.object({
     html : z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
})
const prompt = `Generate  resume for a candidate with the following details:
                 Resume :${resume}
                 Self Description:${selfDescription}
                 job Description:${jobDescription}

                 The response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer
                 `

                 const response =await ai.models.generateContent({
                    model:"gemini-3-flash-preview",
                    contents:prompt,
                    config:{
                        responseMimeType:"application/json",
                        responseSchema:zodToJsonSchema(resumePdfSchema),
                    }
                 })

                 const jsonContent = JSON.parse(response.text);
                 const pdfBuffer = await generatedPdfFromHtml(jsonContent.html)

                 return pdfBuffer
}



module.exports = {
    generateInterviewReport,
    generateResumePdf
};












