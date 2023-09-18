// const fs=require("fs");

// const nfts=JSON.parse(fs.readFileSync(`${__dirname}/../nft-data/data/nft-simple.json`));

// exports.getAllNfts=(req,res)=>{
//     res.status(200).json({
//         status:"success",
//         totalnfts:nfts.length,
//         result:nfts
//     });
// }
// exports.createAllNfts=(req,res)=>{
//     const newId=nfts[nfts.length-1].id+1;
//     const newNft=Object.assign({id:newId},req.body);
//     nfts.push(newNft);
//     fs.writeFile(`${__dirname}/../nft-data/data/nft-simple.json`,JSON.stringify(nfts),err=>{
//         res.status(200).json({
//             status:"success",
//             nft:newNft
//         });
//     });
// }
// exports.getSingleNft=(req,res)=>{
//     const newId=req.params.id*1;
//     const nft=nfts.find((el)=>el.id===newId);
//     res.status(200).json({
//         status:"success",
//         nft
//     });
// }
// exports.PatchNfts=(req,res)=>{
//     if(req.params.id>nfts.length){
//         res.status(404).json({
//             status:"failed",
//             message:"Invalid Id"
//         });
//     }
// }
// exports.DeleteNfts=(req,res)=>{

//     res.status(204).json({
//         status:"failed",
//         data:null
//     })
// }
//---------------------------------Part 2--------------------------
const NFT = require("../models/nftModel");
const ApiFeatures = require("../Utils/apiFeatures");
const AppError=require("../Utils/appError");
const catchAsync=require("../Utils/catchAsync");
exports.aliasTopNnfts=(req,res,next)=>{
    req.query.limit="5";
    req.query.sort="-ratingsAverage,-price";
    req.query.fields="name,price,ratingsAverage"
    next();
}
exports.getAllNfts =catchAsync(async (req, res) => {

    const features = new ApiFeatures(NFT.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  let nfts = await features.query;
  res.status(200).json({
    status: "success",
    result: nfts.length,
    nft: nfts,
  });
});

exports.createNFT =catchAsync(async (req, res) => {
    const newNFT = await NFT.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      newNFT,
    },
  });
});
exports.getSingleNft = catchAsync(async (req, res, next) => {
  
    const nft = await NFT.findById(req.params.id);
    if(!nft){
      return next(new AppError(`No nft found with this id`,404));
    }
  res.status(200).json({
    status: "success",
    data: {
      nft,
    },
  });
});
//Patch Update
exports.updateNFT = catchAsync(async (req, res, next) => {
  
    const nft = await NFT.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if(!nft){
        return next(new AppError(`No nft found with this id`,404));
      }
      res.status(200).json({
        status: "success",
        data: {
          nft,
        },
      });
});
//Delete NFT
exports.deleteNFT =catchAsync(async (req, res, next) => {
 
    const nft = await NFT.findByIdAndDelete(req.params.id);
    if(!nft){
      return next(new AppError(`No nft found with this id`,404));
    }
  res.status(204).json({
    status: "success",
    data: null,
  });
  
});
//Aggregation Pipeline
exports.getNFTsStats = catchAsync(async (req, res) => {
    
      const stats = await NFT.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
          $group: {
            // _id: "$ratingsAverage",
            _id: { $toUpper: "$difficulty" },
            numNFT: { $sum: 1 },
            numRatings: { $sum: "$ratingsQuantity" },
            avgRating: { $avg: "$ratingsAverage" },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
        {
          $sort: { avgRating: 1 },
        },
        // {
        //   $match: {
        //     _id: { $ne: "EASY" },
        //   },
        // },
      ]);
      res.status(200).json({
        status: "success",
        data: {
          stats,
        },
      });
  });
  
  //CALCULATING NUMBER OF NFT CREATE IN THE MONTH OR MONTHLY PLAN
  
  exports.getMonthlyPlan =catchAsync(async (req, res) => {
      const year = req.params.year * 1;
      const plan = await NFT.aggregate([
        {
          $unwind: "$startDates",
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$startDates" },
            numNFTStarts: { $sum: 1 },
            nfts: { $push: "$name" },
          },
        },
        {
          $addFields: {
            month: "$_id",
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $sort: {
            numNFTStarts: -1,
          },
        },
        {
          $limit: 12,
        },
      ]);
      res.status(200).json({
        status: "success",
        data: plan,
      });
    
  });
