// import axios from 'axios';

// const api = axios.create({
//     baseURL:"http://localhost:3000/",
//     withCredentials :true,
// });



// /**
//  * @description service that generate interview report based on resume,selfDescription,jobDescription
//  */
// export const generateInterviewReport=async(jobDescription,selfDescription,resumeFile)=>{
//     const formData = new FormData();
//     formData.append("jobDescription",jobDescription);
//     formData.append("selfDescription",selfDescription);
//     formData.append("resume",resumeFile);


//     const response = await api.post("api/interview",formData,{
//         headers:{
//             "Content-Type":"multipart/form-data"
//         }
//     })
//     return response;
// }


/**
 * @description generate interview report by id
 */
// export const getInterviewReportById = async(interviewId) =>{
// const response = await api.get(`api/interview/report/${interviewId}`);
// return response.data;
// }

/**
//  * @description generate  to get all interview report of logged in user
//  */
// export const getAllInterviewReports = async() => {
//     const response = await api.get("api/interview");

//     return response.data;
// }




import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});


// Generate Interview Report
export const generateInterviewReport = async ({
    jobDescription,
    selfDescription,
    resumeFile
}) => {

    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post(
        "/api/interview",
        formData
    );

    return response.data;
};


// Get Interview Report By ID
export const getInterviewReportById = async (interviewId) => {

    const response = await api.get(
        `/api/interview/${interviewId}`
    );

    return response.data;
};


// Get All Interview Reports
export const getAllInterviewReports = async () => {

    const response = await api.get(
        "/api/interview"
    );

    return response.data;
};



