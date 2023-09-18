//----------------------------------------Part 1-------------------------------------------------------

// const fs=require("fs");
// const express=require("express");
// const app=express();
// app.use(express.json());
// const nfts=JSON.parse(fs.readFileSync(`${__dirname}/./nft-data/data/nft-simple.json`));
// // app.get("/",(req,res)=>{
// //     res.status(200).send("Hello Iam from nft market place");
// // });
// // app.get("/",(req,res)=>{
// //     res.status(200).json({
// //         status:"success",
// //         message:"Hello Iam from NFT Market place"
// //     });
// // });
// // app.post("/",(req,res)=>{
// //     res.status("200").json({
// //         message:"Your Data"
// //     });
// // });
// // //

// //----------------------Get Requests------------------------
// app.get("/api/v1/nfts",(req,res)=>{
//     res.status(200).json({
//         status:"success",
//         result:nfts.length,
//         data:nfts
//     });
// });
// app.post("/api/v1/nfts",(req,res)=>{
//     const newId=nfts[nfts.length-1].id+1;
//     const newNft=Object.assign({id:newId},req.body);
//     nfts.push(newNft);
//     fs.writeFile(`${__dirname}/./nft-data/data/nft-simple.json`,JSON.stringify(nfts),error=>{
//         res.status(200).json({
//             status:"success",
//             nft:newNft
//         });
//     });
// });
// //-------------------------Get Single NFT----------------------------
// app.get("/api/v1/nfts/:id",(req,res)=>{
//     const newId=req.params.id*1;
//     const nft=nfts.find((el)=>el.id===newId);
//     if(newId>nfts.length){
//         if(!nft){
//             res.status(404).json({
//                 status:"failed",
//                 message:"Invalid Data"
//             });
//         }
//     }
//     res.status(200).json({
//         status:"success",
//         result:nft
//     });
// });
// app.patch("/api/v1/nfts/:id",(req,res)=>{
//     if(req.params.id*1>nfts.length){
//         return res.status(404).json({
//             status:"failed",
//             message:"Invalid Id"
//         })
//     }
//     res.status(200).json({
//         status:"success",
//         message:"update data"
//     });
// });

// //Delete Data
// app.delete("/api/v1/nfts/:id",(req,res)=>{
//     if(req.params.id*1>nfts.length){
//         return res.status(404).json({
//             status:"failed",
//             message:"Invalid Id"
//         })
//     }
//     res.status(204).json({
//         status:"success",
//         data:null
//     });
// })

//-----------------------------------------Part 2-------------------------------------------------//
// const fs=require("fs");
// const express=require("express");
// const app=require("./server.js");
// const app=express();
// app.use(express.json());
// const morgan=require("morgan");
// app.use(morgan("dev"));
// //Custom middle ware
// app.use((req,res,next)=>{
// console.log("Hello Iam from middle ware json");
// next();
// });
// app.use((req,res,next)=>{
//     req.requestTime=new Date().toISOString();
//     next();
// });
// const nfts=JSON.parse(fs.readFileSync(`${__dirname}/./nft-data/data/nft-simple.json`));
// const getAllNfts=(req,res)=>{
//     res.status(200).json({
//         status:"success",
//         requestTime:req.requestTime,
//         result:nfts.length
//     });
// }
// const postAllNfts=(req,res)=>{
//     const newId=nfts[nfts.length-1].id+1;
//     const newNft=Object.assign({id:newId},req.body);
//     nfts.push(newNft);
//     fs.writeFile(`${__dirname}/./nft-data/data/nft-simple.json`,JSON.stringify(nfts),err=>{
//         res.status(200).json({
//             status:"success",
//             requestTime:req.requestTime,
//             nft:newNft
//         });
//     });
// }
// // app.get("/api/v1/nfts",getAllNfts);
// // app.post("/api/v1/nfts",postAllNfts);
// app.route("/api/v1/nfts").get(getAllNfts).post(postAllNfts);
//-----------------------------Part4------------------------------
const morgan=require("morgan");
const dotenv=require("dotenv");
dotenv.config({path:"./.env.config"});
const express=require("express");
const NftRoutes=require("./routes/nftsRoute");
const UserRoutes=require("./routes/usersRoute");
const AppError=require("./Utils/appError");
const rateLimit=require("express-rate-limit");
const globalErrorHandler=require("./controllers/errorController");
const helmet=require("helmet");
const mongoSanitize=require("express-mongo-sanitize");
const xss=require("xss-clean");
const hpp=require("hpp");
const app=express();
app.use(express.json({limit:"10kb"}));

//Data Sanitization against noSQL query injection
app.use(mongoSanitize());
//Data Sanitization againse site script XSS
app.use(xss());
//Secure Http Header
//Prevent Parameter Pollution
app.use(hpp({
    whitelist:["duration","difficulty"]
}));
app.use(helmet());
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:"To many request from this ip,Please try again later"
});
app.use('/api',limiter);
app.use(morgan("dev"));
app.use(express.static(`${__dirname}/./nft-data/img`));
app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    next();
})
app.use("/api/v1/nfts",NftRoutes);
app.use("/api/v1/users",UserRoutes);
app.all("*",(req,res,next)=>{

    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
})
app.use(globalErrorHandler);
module.exports=app;

