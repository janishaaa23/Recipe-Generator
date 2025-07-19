import mongoose, { Schema } from "mongoose";

const userSchema= new mongoose.Schema({
  email:{
    type:String,
    required:true,
    unique:true,
  },
  fullname:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
    minlength:8,
  },
},{timestamps:true})

export const User = mongoose.model("User",userSchema)