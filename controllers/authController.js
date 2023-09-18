const User = require("../models/userModel");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.config" });
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail=require("../Utils/email");
const crypto=require("crypto");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken=(user,statusCode,res)=>{
  const token=signToken(user._id);
  const cookieOptions={
    expires:new Date(
      Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000
    ),
    httpOnly:true
  }
  if(process.env.NODE_ENV==="production")cookieOptions.secure=true;
  res.cookie("jwt",token,cookieOptions);
  user.password=undefined;
  res.status(statusCode).json({
    status:"success",
    token,
    user
  });

}
exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  // const newUser=await User.create({
  //     name:req.body.name,
  //     email:req.body.email,
  //     password:req.body.password,
  //     passwordConfirm:req.body.passwordConfirm
  // });
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: "Success",
  //   token,
  //   data: newUser,
  // });
  createSendToken(newUser,200,res)
});
//Login User
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(`Please provide your email & password`));
  }
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email and password`, 401));
  }
  // const token = signToken(user.id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  createSendToken(user,200,res);
});
exports.protect = catchAsync(async (req, res, next) => {
  //1 Check token
  //2 Validate token
  //3 user exist
  //4 change password
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Your not logged in to get access", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(`The User belong to this token is no longer exist`, 401)
    );
  }
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError(`User recently changed the password`, 401));
  }
  //User will have access the protected data
  req.user = currentUser;  
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const role = req.user.role;
    if (!roles.includes(role)) {
      return next(new AppError("You have no access to delete NFT", 403));
    }
    next();
  };
};
//Forget Password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //Get the user based on the given email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`There is no user with this email`, 404));
  }
  //2 Create a random token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave:false});
//   3 Send email back to the user
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget your password?Submit your patch request with new password and confirm password: ${resetURL}. \n If you didn't forget your password please ignore this message`;
  try {
    await sendEmail({
        email:user.email,
        subject:"Your password reset token valid for 10 mins",
        message,
      });
      res.status(200).json({
        status:"success",
        message:"Token sent to email"
      })
  } catch (error) {
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save({validateBeforeSave:false});

    return next(new AppError(`There was an error to sending the email`,500));
  } 
});
//Reset Password
exports.resetPassword = catchAsync( async (req, res, next) => {
    //1 Get user based on the token
    const hashedToken=crypto.createHash("sha256").update(req.params.token ).digest("hex");
    const user=await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt:Date.now()},
    });
    if(!user){
        return next(new AppError(`The token is invalid or has expired`,400));
    }
    //2 If the token has not expired,and there is user set the new password,
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    //3 Update Change password for the user
    //4 Log the user in and send JWT
  //   const token = signToken(user.id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  createSendToken(user,200,res);
});
//Update Password
exports.updatePassword=catchAsync(async(req,res,next)=>{
  //1 Get the password from the user
  const user=await User.findById(req.user.id).select("+password");
  //2 Compare the password that user give with his current password
  if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
    return next(new AppError(`Your current password is wrong`,401));
  }
  //3 IF So then Update the password
  user.password=req.body.password;
  user.passwordConfirm=req.body.passwordConfirm;
  await user.save();
  //4 LogIn the user with current password
  createSendToken(user,200,res);
})