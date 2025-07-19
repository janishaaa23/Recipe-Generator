import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'


const generateToken = (userId,res)=>{
  const token = jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn:"7D"
  })

  res.cookie("token",token,{
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
  })

  return  token
}

const signUp = AsyncHandler(async(req,res)=>{
  console.log(req.body)
  const {fullname,email,password}=req.body
 
    if(!fullname||!email||!password){
      throw new ApiError(400,"all fields are required")
    }

    if(password.length<8){
      throw new ApiError(400,"password must be at least 8 characters")
    }

    const existingUser = await User.findOne({email})
    if(existingUser){
      throw new ApiError(400,"user with this email already exist")
    }


    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    
    // Create the new user
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    })

    if(!newUser){
      throw new ApiError(400,"error while creating a new user")
    }

    generateToken(newUser._id,res);

    return res
    .status(200)
    .json(
      new ApiResponse(200,"new user signedUp successfully",newUser)
    )

})


const login = AsyncHandler(async(req,res)=>{
  console.log('Login request received:', req.body);
  const {email,password} = req.body

  if(!email||!password){
    console.log('Missing email or password');
    throw new ApiError(400,"all field are required")
  }
  if(password.length<8){
    console.log('Password too short');
    throw new ApiError(400,"password has to be at least 8 characters")
  }

  console.log('Looking for user with email:', email);
  const user = await User.findOne({ $or: [{ email: email }] })
  if(!user){
    console.log('User not found');
    throw new ApiError(400,"invalid credentials 1")
  }

  console.log('User found, checking password');
  const isPasswordCorrect = await bcrypt.compare(password,user.password)
  if(!isPasswordCorrect){
    console.log('Password incorrect');
    throw new ApiError(400,"invalid credentials 2")
  }
  
  console.log('Password correct, generating token');
  generateToken(user._id,res)
  
  console.log('Login successful for user:', user.email);
  return res
  .status(200)
  .json(
    new ApiResponse(200,"user is logged in successfully",user)
  )
})

const logout =  AsyncHandler(async(req,res)=>{
  res.cookie("token","",{maxAge:0})
  return res
  .status(200)
  .json(
    new ApiResponse(200,"logged out successfully",null)
  )
})

const me = AsyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "Current user", req.user));
});

export{
  login,
  signUp,
  logout,
  me,
}