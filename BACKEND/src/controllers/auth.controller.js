const userModel = require("../models/user.model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model")

/**
 * @route api/auth/register
 * @description register a new user
 * @access public 
 */

async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please Provide Valid Information"
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account Already Exist"
        });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    });

    return res.status(201).json({
        message: "User Registered Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}


/* user login */
/**
 * @name loginUserController
 * @description login user
 * @access public
 */
async function loginUserController(req,res){
    const {email,password}=req.body;
    const user=await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"invalid email and password"
        })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({
        message:"invalid user password"
        })
    }

    const token=jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

// res.cookie("token",token);
res.cookie("token", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: false
});

res.status(200).json({
    message:"user login successfully",
    user:{
        id:user._id,
        username:user.username,
        email:user.email
    }
})

}


/**
 * @route api/auth/logout
 * @discription clear token from user cookie and the token in blACKLIST
 * @access public
*/
async function logoutUserController(req,res){
    const token = req.cookies.token
    if(token){
         await tokenBlacklistModel.create({token})
    }
    res.clearCookie("token");

    res.status(200).json({
        message:"User logout successfully"
    })
}

/** 
 * @route GET api/auth/get-me
 * @discription Get current logged in user
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    return res.status(200).json({
        message: "User fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}







module.exports={registerUserController,loginUserController,logoutUserController,getMeController};