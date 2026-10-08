import { useContext,useEffect} from "react";
import { AuthContext } from "../auth.context";
import {login,register,logout,getMe} from "../services/auth.api"


export const useAuth=()=>{
    const context = useContext(AuthContext);
    const {user,setUser,loading,setLoading}=context;


const handleLogin = async ({ email, password }) => {
    setLoading(true);

    try {
        const data = await login({
            email,
            password
        });

        if (!data?.user) {
            return false;
        }

        setUser(data.user);

        return true;

    } catch (error) {
        console.log(
            "LOGIN ERROR:",
            error.response?.data?.message || error.message
        );

        setUser(null);

        return false;

    } finally {
        setLoading(false);
    }
};



const handleRegister = async ({ username, email, password }) => {
    setLoading(true);

    try {
        const data = await register({
            username,
            email,
            password
        });

        console.log("REGISTER DATA:", data);

        return true;

    } catch (error) {
        console.log(
            "REGISTER ERROR:",
            error.response?.data?.message || error.message
        );

        return false;

    } finally {
        setLoading(false);
    }
};


 const handleLogout=async()=>{
 setLoading(true);
 try{
 const data = await logout();
    setUser(null);
 }catch(error){
    console.log(error);
 }finally{
    setLoading(false);
 }
}


useEffect(() => {
  const getAndSetUser = async () => {
    try {
      const data = await getMe();

      console.log("GET ME DATA:", data);

      setUser(data?.user || null);
    } catch (error) {
      console.log("User is not logged in");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  getAndSetUser();
}, []);

return {user,loading,handleRegister,handleLogin,handleLogout}
}




