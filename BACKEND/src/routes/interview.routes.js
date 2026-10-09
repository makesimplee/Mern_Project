
const express = require("express");

let puppeteer;

async function getPuppeteer() {
    if (!puppeteer) {
        const module = await import("puppeteer");
        puppeteer = module.default || module;
    }

    return puppeteer;
}

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const authMiddleware =
    require("../middlewares/auth.middleware");

const interviewController =
    require("../controllers/interview.controller");

const upload =
    require("../middlewares/file.middleware");

const interviewRouter = express.Router();


// =====================================================
// Generate Interview Report
// POST /api/interview
// =====================================================

interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    interviewController.generateInterviewReportController
);


// =====================================================
// Get All Interview Reports
// GET /api/interview
// =====================================================

interviewRouter.get(
    "/",
    authMiddleware.authUser,
    interviewController.getAllInterviewReportsController
);


// =====================================================
// TEST PUPPETEER PDF
// GET /api/interview/test-pdf
// =====================================================

interviewRouter.get(
    "/test-pdf",
    async (req, res) => {
        let browser;

        try {
            console.log("PUPPETEER TEST STARTED");

            const puppeteerInstance = await getPuppeteer();

            browser = await puppeteerInstance.launch({
                headless: true
            });

            console.log("PUPPETEER BROWSER STARTED");

            const page = await browser.newPage();

            await page.setContent(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Puppeteer Test</title>
                    </head>
                    <body>
                        <h1>Puppeteer Working 🚀</h1>
                        <p>PDF generated successfully.</p>
                    </body>
                </html>
            `);

            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true
            });

            console.log("PDF GENERATED SUCCESSFULLY");

            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    'attachment; filename="test.pdf"'
            });

            return res.send(pdfBuffer);

        } catch (error) {
            console.error("PUPPETEER TEST ERROR:", error);

            return res.status(500).json({
                success: false,
                message: error.message
            });

        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch (closeError) {
                    console.error(
                        "PUPPETEER BROWSER CLOSE ERROR:",
                        closeError
                    );
                }
            }
        }
    }
);


// =====================================================
// TEST GEMINI
// GET /api/interview/test-ai
// =====================================================

interviewRouter.get(
    "/test-ai",
    async (req, res) => {
        try {
            console.log("GEMINI TEST STARTED");

            const response =
                await ai.models.generateContent({
                    model: "gemini-3.8-flash",
                    contents: "Say hello"
                });

            const text =
                typeof response.text === "function"
                    ? response.text()
                    : response.text;

            return res.json({
                success: true,
                text
            });

        } catch (error) {
            console.error("GEMINI TEST ERROR:", error);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


// =====================================================
// FUTURE ROUTE
// Generate Resume PDF
// =====================================================

/*
interviewRouter.get(
    "/resume/pdf/:interviewReportID",
    authMiddleware.authUser,
    interviewController.generateResumePdfController
);
*/


// =====================================================
// Get Interview Report By ID
// GET /api/interview/:interviewId
// IMPORTANT: Keep this route LAST.
// =====================================================

interviewRouter.get(
    "/:interviewId",
    authMiddleware.authUser,
    interviewController.generateInterviewReportByIdController
);


module.exports = interviewRouter;
