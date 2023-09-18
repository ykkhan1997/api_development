const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:"./.env.config"});
process.on("uncaughtException",(err)=>{
    console.log(err);
    console.log("UncaughtException error application shutting down");
    process.exit(1);
});
const DB=process.env.DATABASE.replace("<password>",process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then((can)=>{
    console.log("DB connection Successfully");
});
const app=require("./app");
const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
});
process.on("unhandledRejection",(err)=>{
    console.log(err.name,err.message);
    console.log("unhandledRejecting shutting down application");
        process.exit(1);
});