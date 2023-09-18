const express=require("express");
const {protect,restrictTo}=require("../controllers/authController");
const {aliasTopNnfts,getAllNfts,updateNFT,getSingleNft,deleteNFT,createNFT,getNFTsStats,getMonthlyPlan}=require("../controllers/nftController");
const router=express.Router();
router.route("/top-5-nfts").get(protect,restrictTo("admin","guide"),aliasTopNnfts,getAllNfts);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/nfts-stats").get(getNFTsStats);
router.route("/").get(protect,getAllNfts).post(createNFT);
router.route("/:id").get(getSingleNft).patch(updateNFT).delete(protect, restrictTo("admin","guide"), deleteNFT);
// .patch(PatchNfts).delete(DeleteNfts);
module.exports=router;

