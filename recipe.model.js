import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title:{
    type:String,
  },
  content:{
    type:String,
  },
  rating:{
    type:Number,
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  searchType: {
    type: String,
    enum: ["ingredient", "name"],
    required: true
  }
},{timestamps:true})

export const Recipe = mongoose.model("Recipe",recipeSchema);