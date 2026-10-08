import "../style/interview.scss";
import { useEffect, useState } from "react";
import { useInterview } from "../hooks/useInterview";
import { useParams } from "react-router-dom";

const Interview = () => {
    const {
        report,
        loading,
        getReportById
    } = useInterview();

    const { interviewId } = useParams();

    const [activeSection, setActiveSection] = useState("technical");

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        }
    }, [interviewId]);

    if (loading) {
        return (
            <main className="report-page">
                <section className="report-container">
                    <div className="loading">
                        <h2>Loading Interview Report...</h2>
                        <p>Please wait while we fetch your report.</p>
                    </div>
                </section>
            </main>
        );
    }

    if (!report) {
        return (
            <main className="report-page">
                <section className="report-container">
                    <div className="loading">
                        <h2>No Interview Report Found</h2>
                        <p>Generate an interview report first.</p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="report-page">
            <section className="report-container">

                {/* LEFT SIDEBAR */}
                <aside className="sidebar-left">

                    <h3>
                        {report.title || "Interview Report"}
                    </h3>

                    <button
                        className={`menu-item ${
                            activeSection === "technical"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveSection("technical")
                        }
                    >
                        Technical Questions
                    </button>

                    <button
                        className={`menu-item ${
                            activeSection === "behavioral"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveSection("behavioral")
                        }
                    >
                        Behavioral Questions
                    </button>

                    <button
                        className={`menu-item ${
                            activeSection === "roadmap"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveSection("roadmap")
                        }
                    >
                        Roadmap
                    </button>

                    <div className="sidebar-footer">
                        <button className="download-btn">
                            Download PDF
                        </button>
                    </div>

                </aside>


                {/* MAIN CONTENT */}
                <section className="report-content">

                    <div className="content-header">

                        <h2>
                            {activeSection === "technical" &&
                                "Technical Questions"}

                            {activeSection === "behavioral" &&
                                "Behavioral Questions"}

                            {activeSection === "roadmap" &&
                                "Preparation Roadmap"}
                        </h2>

                    </div>


                    <div className="content-body">

                        {/* TECHNICAL QUESTIONS */}

                        {activeSection === "technical" && (
                            <>
                                {report.technicalQuestions?.length > 0 ? (
                                    report.technicalQuestions.map(
                                        (question, index) => (
                                            <div
                                                className="question-card"
                                                key={
                                                    question._id ||
                                                    index
                                                }
                                            >
                                                <h4>
                                                    {index + 1}.{" "}
                                                    {question.question}
                                                </h4>

                                                <p>
                                                    {question.answer ||
                                                        question.expectedAnswer ||
                                                        "No answer provided."}
                                                </p>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p>
                                        No technical questions found.
                                    </p>
                                )}
                            </>
                        )}


                        {/* BEHAVIORAL QUESTIONS */}

                        {activeSection === "behavioral" && (
                            <>
                                {report.behavioralQuestions?.length > 0 ? (
                                    report.behavioralQuestions.map(
                                        (question, index) => (
                                            <div
                                                className="question-card"
                                                key={
                                                    question._id ||
                                                    index
                                                }
                                            >
                                                <h4>
                                                    {index + 1}.{" "}
                                                    {question.question}
                                                </h4>

                                                <p>
                                                    {question.answer ||
                                                        question.expectedAnswer ||
                                                        "No answer provided."}
                                                </p>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p>
                                        No behavioral questions found.
                                    </p>
                                )}
                            </>
                        )}


                        {/* ROADMAP */}

                        {activeSection === "roadmap" && (
                            <>
                                {report.preparationPlan?.length > 0 ? (
                                    report.preparationPlan.map(
                                        (plan, index) => (
                                            <div
                                                className="question-card"
                                                key={
                                                    plan._id ||
                                                    index
                                                }
                                            >
                                                <h4>
                                                    Day {plan.day}
                                                </h4>

                                                <h5>Focus</h5>

                                                <ul>
                                                    {plan.focus?.map(
                                                        (
                                                            item,
                                                            focusIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    focusIndex
                                                                }
                                                            >
                                                                {item}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>

                                                <h5>Tasks</h5>

                                                <ul>
                                                    {plan.task?.map(
                                                        (
                                                            item,
                                                            taskIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    taskIndex
                                                                }
                                                            >
                                                                {item}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>

                                            </div>
                                        )
                                    )
                                ) : (
                                    <p>
                                        No preparation plan found.
                                    </p>
                                )}
                            </>
                        )}

                    </div>

                </section>


                {/* RIGHT SIDEBAR */}

                <aside className="sidebar-right">

                    {/* SCORE */}

                    <div className="score-card">

                        <h3>Match Score</h3>

                        <div className="progress-circle">

                            <svg viewBox="0 0 120 120">

                                <circle
                                    className="bg"
                                    cx="60"
                                    cy="60"
                                    r="52"
                                />

                                <circle
                                    className="progress"
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    style={{
                                        strokeDashoffset:
                                            326.7 -
                                            (326.7 *
                                                (report.matchScore || 0)) /
                                            100
                                    }}
                                />

                            </svg>

                            <div className="score-text">
                                {report.matchScore || 0}%
                            </div>

                        </div>

                        <p>
                            {report.matchScore >= 80
                                ? "Strong Profile Match"
                                : report.matchScore >= 60
                                ? "Good Profile Match"
                                : "Profile Needs Improvement"}
                        </p>

                    </div>


                    {/* SKILL GAPS */}

                    <div className="skill-section">

                        <h3>Skill Gaps</h3>

                        <div className="skills">

                            {report.skillGaps?.length > 0 ? (
                                report.skillGaps.map(
                                    (skill, index) => (
                                        <span
                                            key={
                                                skill._id ||
                                                index
                                            }
                                        >
                                            {skill.skill ||
                                                skill.name ||
                                                skill}
                                        </span>
                                    )
                                )
                            ) : (
                                <p>
                                    No skill gaps found.
                                </p>
                            )}

                        </div>

                    </div>

                </aside>

            </section>
        </main>
    );
};

export default Interview;