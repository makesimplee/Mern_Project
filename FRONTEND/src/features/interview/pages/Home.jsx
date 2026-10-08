
import { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { loading, generateReport } = useInterview();

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");

  const resumeInputRef = useRef(null);

  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    try {
      const resumeFile = resumeInputRef.current?.files?.[0];

      console.log("JOB DESCRIPTION:", jobDescription);
      console.log("SELF DESCRIPTION:", selfDescription);
      console.log("RESUME FILE:", resumeFile);

      if (!jobDescription.trim()) {
        alert("Please enter job description");
        return;
      }

      if (!resumeFile) {
        alert("Please upload your resume PDF");
        return;
      }

      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile
      });

      console.log("GENERATED REPORT:", data);

      if (data?._id) {
        navigate(`/interview/${data._id}`);
      }

    } catch (error) {
      console.error(
        "GENERATE REPORT ERROR:",
        error?.response?.data || error
      );
    }
  };

  return (
    <main className="home">

      <div className="interview-input-group">

        {/* ================= LEFT ================= */}

        <div className="left">

          <label htmlFor="jobDescription">
            Job Description
          </label>

          <textarea
            name="jobDescription"
            id="jobDescription"
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder="Enter Job Description Here..."
          />

        </div>


        {/* ================= RIGHT ================= */}

        <div className="right">

          {/* Resume */}

          <div className="input-group">

            <p>
              Resume{" "}
              <small className="highlight">
                (Use Resume and self description together for best result)
              </small>
            </p>

            <label
              className="file-label"
              htmlFor="resume"
            >
              Upload Resume
            </label>

            <input
              ref={resumeInputRef}
              type="file"
              name="resume"
              id="resume"
              accept=".pdf,application/pdf"
            />

          </div>


          {/* Self Description */}

          <div className="input-group">

            <label htmlFor="selfDescription">
              Self Description
            </label>

            <textarea
              name="selfDescription"
              id="selfDescription"
              value={selfDescription}
              onChange={(e) =>
                setSelfDescription(e.target.value)
              }
              placeholder="Describe Yourself In a Few Sentences..."
            />

          </div>


          {/* Generate Button */}

          <button
            onClick={handleGenerateReport}
            className="button primary-button"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Interview Report"}
          </button>

        </div>

      </div>

    </main>
  );
};

export default Home;