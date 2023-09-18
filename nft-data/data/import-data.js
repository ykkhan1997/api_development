const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({path:"./.env.config"});
const NFT=require("../../models/nftModel");

const DB=process.env.DATABASE.replace("<password>",process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology: true
  })
  .then((con) => {
    // console.log(con.connection);
    console.log("DB Connection Successfully");
  });

const nfts = JSON.parse(
  fs.readFileSync(`${__dirname}/nft-simple.json`, "utf-8")
);

// IMPORT DATA
const importDate = async () => {
  try {
    await NFT.create(nfts);
    console.log("DATA successfully Loaded");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
//DELETE DATA
const deleteData = async () => {
  try {
    await NFT.deleteMany();
    console.log("DATA successfully Deleted");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
if (process.argv[2]=== "--import") {
  importDate();
} else if (process.argv[2] === "--delete") {
  deleteData();
}