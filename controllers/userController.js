const User=require("../models/userModel");
const AppError = require("../Utils/appError");
const catchAsync=require("../Utils/catchAsync");
const filterObj=(obj,...allowFields)=>{
  const newObj={};
  Object.keys(obj).forEach((el)=>{
    if(allowFields.includes(el)) newObj[el]=obj[el];
  });
  return newObj;
}
exports.updatedMe=catchAsync(async(req,res,next)=>{
  //1 Create Error if user updating password
  if(req.body.password ||req.body.passwordConfirm){
    // console.log(req.user.id);
    return next(
      new AppError(`This router is not for password update.Please use this to update password /updatePassword.`,400)
    ); 
  }
  //Update User Data
  const filteredBody=filterObj(req.body,"name","email");
  const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
    runValidators:true
  });
  res.status(200).json({
    status:"Success",
    data:{
      user:updatedUser
    }
  });
});
exports.deleteMe=catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false});
  res.status(204).json({
    status:"success",
    message:"Your account is successfully inactive"
  });
});
exports.getAllUsers =catchAsync(async(req, res) => {
  const newUser=await User.find();
  res.status(500).json({
    status: "success",
    result:newUser.length,
    data:{
      user:{
        newUser
      }
    }
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

exports.getSingleUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
