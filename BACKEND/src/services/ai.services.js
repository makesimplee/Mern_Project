```javascript
const { GoogleGenAI } = require("@google/genai");
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
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
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
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
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
                    skill: { type: "string" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"]
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "integer" },
                    focus: {
                        type: "array",
                        items: { type: "string" }
                    },
                    task: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["day", "focus", "task"]
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
| Gemini Request With Retry
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

            console.log("Gemini request successful.");

            return response;
        } catch (error) {
            console.error(
                `Gemini request failed on attempt ${attempt + 1}`
            );
            console.error(error?.message || error);

            const errorMessage = error?.message || "";

            const isTemporaryError =
                error?.status === 503 ||
                error?.code === 503 ||
                errorMessage.includes("503") ||
                errorMessage.includes("UNAVAILABLE") ||
                errorMessage.includes("high demand");

            if (!isTemporaryError) {
                throw error;
            }

            if (attempt === maxRetries - 1) {
                throw new Error(
                    "AI service is temporarily unavailable. Please try again later."
                );
            }

            const delay = 1000 * Math.pow(2, attempt);

            console.log(
                `Retrying Gemini request in ${delay / 1000} seconds...`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error("AI request failed after retries.");
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
        console.log("AI request started...");

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
4. Each technical question must contain question, intention and answer.
5. Generate exactly 5 behavioral interview questions.
6. Each behavioral question must contain question, intention and answer.
7. Identify the candidate's skill gaps.
8. Each skill gap must contain skill and severity.
9. Severity must be "low", "medium" or "high".
10. Create a 7-day preparation plan.
11. Each preparation plan item must contain day, focus and task.
12. focus and task must be arrays of strings.

Return only valid JSON matching the provided response schema.
`;

        const response = await generateWithRetry(prompt, {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema
        });

        console.log("AI response received.");

        const responseText =
            typeof response.text === "function"
                ? response.text()
                : response.text;

        if (!responseText) {
            throw new Error("Gemini returned an empty response.");
        }

        const parsedData = JSON.parse(responseText);

        console.log("AI report parsed successfully.");

        return parsedData;
    } catch (error) {
        console.error("AI generation failed:");
        console.error(error?.message || error);

        throw error;
    }
}

/*
|--------------------------------------------------------------------------
| HTML To PDF Generation
|--------------------------------------------------------------------------
*/

async function generatedPdfFromHtml(htmlContent) {
    let browser;

    try {
        // Puppeteer is loaded dynamically for CommonJS compatibility.
        const puppeteerModule = await import("puppeteer");
        const puppeteer = puppeteerModule.default || puppeteerModule;

        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true
        });

        return Buffer.from(pdfBuffer);
    } catch (error) {
        console.error("PDF generation failed:");
        console.error(error?.message || error);

        throw error;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error(
                    "Puppeteer browser close error:",
                    closeError?.message || closeError
                );
            }
        }
    }
}

/*
|--------------------------------------------------------------------------
| Generate Resume PDF
|--------------------------------------------------------------------------
*/

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    try {
        const resumePdfSchema = z.object({
            html: z.string().describe(
                "The HTML content of the resume which can be converted to PDF using Puppeteer"
            )
        });

        const prompt = `
Generate a professional resume for a candidate using the following details.

Resume:
${resume}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}

Return a JSON object with a single field named "html".
The html field must contain a complete HTML resume document.
Return valid JSON only.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema)
            }
        });

        const responseText =
            typeof response.text === "function"
                ? response.text()
                : response.text;

        if (!responseText) {
            throw new Error("Gemini returned an empty resume response.");
        }

        const jsonContent = JSON.parse(responseText);

        const validatedContent = resumePdfSchema.parse(jsonContent);

        const pdfBuffer = await generatedPdfFromHtml(
            validatedContent.html
        );

        return pdfBuffer;
    } catch (error) {
        console.error("Resume PDF generation failed:");
        console.error(error?.message || error);

        throw error;
    }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
    generateInterviewReport,
    generateResumePdf
};
```
