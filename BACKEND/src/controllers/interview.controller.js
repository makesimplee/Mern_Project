const pdfParse = require("pdf-parse");


const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.services");

const interviewReportModel =
    require("../models/interviewReport.model");


/**
 * @description Generate interview report
 * @route POST /api/interview
 * @access Private
 */
async function generateInterviewReportController(req, res) {
    try {
        // Check PDF file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF file is required."
            });
        }

        // Parse PDF
        const pdfData = await pdfParse(req.file.buffer);

        const resumeContent = pdfData.text;

        // Get form data
        const {
            selfDescription,
            jobDescription
        } = req.body;

        // Validate job description
        if (!jobDescription) {
            return res.status(400).json({
                success: false,
                message: "Job description is required."
            });
        }

        // Generate report using AI
        const interviewReportByAi =
            await generateInterviewReport({
                resume: resumeContent,
                selfDescription,
                jobDescription
            });



// const interviewReportByAi = {
//     title: "Frontend Developer",

//     matchScore: 82,

//     technicalQuestions: [
//         {
//             question: "What is React?",
//             intention: "Check React fundamentals",
//             answer: "React is a JavaScript library used for building user interfaces."
//         },
//         {
//             question: "What is useState?",
//             intention: "Check React hooks knowledge",
//             answer: "useState is a React hook used to manage component state."
//         },
//         {
//             question: "What is useEffect?",
//             intention: "Check lifecycle understanding",
//             answer: "useEffect is used to perform side effects in React components."
//         },
//         {
//             question: "What is REST API?",
//             intention: "Check backend communication knowledge",
//             answer: "REST is an architectural style for communication between applications over HTTP."
//         },
//         {
//             question: "What is MongoDB?",
//             intention: "Check database knowledge",
//             answer: "MongoDB is a NoSQL document database."
//         }
//     ],

//     behavioralQuestions: [
//         {
//             question: "Tell me about yourself.",
//             intention: "Check communication skills",
//             answer: "Give a short introduction about your skills, projects and goals."
//         },
//         {
//             question: "Tell me about a difficult problem you solved.",
//             intention: "Check problem-solving ability",
//             answer: "Explain the problem, your approach, action and result."
//         },
//         {
//             question: "How do you handle deadlines?",
//             intention: "Check time management",
//             answer: "I prioritize tasks and break large work into smaller milestones."
//         },
//         {
//             question: "How do you work in a team?",
//             intention: "Check teamwork",
//             answer: "I communicate clearly, share progress and support team members."
//         },
//         {
//             question: "Why should we hire you?",
//             intention: "Check candidate confidence",
//             answer: "Connect your skills and projects directly with the job requirements."
//         }
//     ],

//     skillGaps: [
//         {
//             skill: "Docker",
//             severity: "medium"
//         },
//         {
//             skill: "System Design",
//             severity: "high"
//         }
//     ],

//     preparationPlan: [
//         {
//             day: 1,
//             focus: ["JavaScript"],
//             task: ["Revise closures", "Practice promises"]
//         },
//         {
//             day: 2,
//             focus: ["React"],
//             task: ["Practice hooks", "Build components"]
//         },
//         {
//             day: 3,
//             focus: ["Node.js"],
//             task: ["Revise Express", "Practice APIs"]
//         },
//         {
//             day: 4,
//             focus: ["MongoDB"],
//             task: ["Practice queries", "Revise schemas"]
//         },
//         {
//             day: 5,
//             focus: ["Projects"],
//             task: ["Prepare project explanation"]
//         },
//         {
//             day: 6,
//             focus: ["Interview"],
//             task: ["Practice technical questions"]
//         },
//         {
//             day: 7,
//             focus: ["Revision"],
//             task: ["Mock interview", "Final revision"]
//         }
//     ]
// };






        // Save report in database
        const interviewReport =
            await interviewReportModel.create({
                user: req.user.id,
                resume: resumeContent,
                selfDescription,
                jobDescription,
                ...interviewReportByAi
            });

        // Success response
        return res.status(201).json({
            success: true,
            message: "Interview Report Generated Successfully",
            interviewReport
        });

    } catch (error) {

        console.error(
            "Generate Interview Report Error:"
        );

        console.error(
            error?.message || error
        );

        const errorMessage =
            error?.message || "";

        const isGeminiUnavailable =
            errorMessage.includes(
                "AI service is temporarily busy"
            ) ||
            errorMessage.includes("503") ||
            errorMessage.includes("UNAVAILABLE") ||
            errorMessage.includes("high demand");

        if (isGeminiUnavailable) {
            return res.status(503).json({
                success: false,
                message:
                    "AI service is temporarily unavailable. Please try again in a few moments."
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while generating the interview report."
        });
    }
}


/**
 * @description Get interview report by ID
 * @route GET /api/interview/:interviewId
 * @access Private
 */
async function generateInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport =
            await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id
            });

        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview Report Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interview Report Fetched Successfully",
            interviewReport
        });

    } catch (error) {

        console.error(
            "Get Interview Report Error:"
        );

        console.error(
            error?.message || error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching the interview report."
        });
    }
}


/**
 * @description Get all interview reports of logged-in user
 * @route GET /api/interview
 * @access Private
 */
async function getAllInterviewReportsController(req, res) {
    try {

        const interviewReports =
            await interviewReportModel
                .find({
                    user: req.user.id
                })
                .sort({
                    createdAt: -1
                })
                .select(
                    "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
                );

        return res.status(200).json({
            success: true,
            message:
                "Interview reports fetched successfully",
            interviewReports
        });

    } catch (error) {

        console.error(
            "Get All Interview Reports Error:"
        );

        console.error(
            error?.message || error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching interview reports."
        });
    }
}



/**
 * @description controller to generate resume PDF based on user self Description,resume and job description
 */
async function generateResumePdfController(req,res){
    const {interviewReportId} = req.params;
    const interviewReport = await interviewReportModel.findById(interviewReportId);

    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }
    const {resume,jobDescription,selfDescription} = interviewReport;
    const pdfBuffer = await generateResumePdf({resume,jobDescription,selfDescription})
    res.set({
        "Content-Type":"application/pdf",
        "Content-Disposition":`attachment; filename=resume_${interviewReportId}.pdf`
    })
    res.send(pdfBuffer)
}


module.exports = {
    generateInterviewReportController,
    generateInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
