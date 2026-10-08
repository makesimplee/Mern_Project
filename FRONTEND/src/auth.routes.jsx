// import {createBrowserRouter} from "react-router-dom";
// import Login from "./features/auth/pages/Login"
// import Register from "./features/auth/pages/Register"
// import Protected from "./features/auth/components/Protected";

// export const router=createBrowserRouter([
//     {
//         path:"/register",
//         element:<Register />
//     },
//       {
//         path:"/login",
//         element:<Login />
//     },
//     {
//         path:"/",
//         element:<Protected><h1>home page</h1></Protected>
//     }
// ])


import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";

export const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: 
      <Protected>
        <Home />
      </Protected>
  },
  {
    path:"/interview/:interviewId",
    element:<Protected><Interview/></Protected>
  }
]);

