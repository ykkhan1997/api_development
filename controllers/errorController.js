const AppError=require(`../Utils/appError`);
// module.exports=(err,req,res,next)=>{
//     err.statusCode=err.statusCode||500;
//     err.status=err.status||"error";
//     res.status(err.statusCode).json({
//         status:err.status,
//         message:err.message
//     });
//     next();
// }
const handleCastError=(err)=>{
    let {path,value}=err;
    const message=`Invalid ${path}:${value}`;
    return new AppError(message,400);
}
const handleDuplicateFieldsDB=(err)=>{
    const errorMessage=err.message;
    const value=errorMessage.match(/(?<=")(?:\\.|[^"\\])*(?=")/);
    const message=`Duplicate fields value ${value},please use another value`;
    return new AppError(message,400);
}
const handleValidationError=(err)=>{
    const errors=Object.values(err.errors).map((el)=>el.message);
    const message=`Invalid input Data. ${errors.join(", ")}`;
    return new AppError(message,404);
}
const handleJWTWebTokenError=(err)=>new AppError(`Invalid token error,please login again`,401);
const handleJWTTokenExpired=(err)=>new AppError(`Your token is expired,please login again`,401);
const sendDevError=(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        error:err,
        stack:err.stack
    })
}
const sendErrorPro=(err,res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        });
    }else{
        res.status(500).json({
            status:"error",
            message:"something went wrong"
        })
    }
}
console.log(process.env.NODE_ENV);
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.status=err.status||"error";
    if(process.env.NODE_ENV==="development"){
        sendDevError(err,res);
    }else if(process.env.NODE_ENV==="production"){
        let{name,code}=err;
        if(name==="CastError") err=handleCastError(err);
        if(code===11000) err=handleDuplicateFieldsDB(err);
        if(name==="ValidationError") err=handleValidationError(err);
        if(name==="JsonWebTokenError")err=handleJWTWebTokenError(err);
        if(name==="TokenExpiredError")err=handleJWTTokenExpired(err);
        console.log(name);
        sendErrorPro(err,res);
    }
    next();
}