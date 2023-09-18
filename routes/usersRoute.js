const UserControllers = require("../controllers/userController");
const express = require("express");
const {updatedMe,deleteMe}=require("../controllers/userController");
const { signUp, logIn, forgetPassword, resetPassword,updatePassword, protect } = require("../controllers/authController");
const router = express.Router();


router.route("/signup").post(signUp);
router.post("/login",logIn);
router.post("/forgetPassword",forgetPassword);
router.patch("/resetPassword/:token",resetPassword);
router.patch("/updatePassword",protect, updatePassword);
router.patch("/updatedMe",protect,updatedMe);
router.delete("/deleteMe",protect,deleteMe);
router
  .route("/")
  .get(UserControllers.getAllUsers)
  .post(UserControllers.createUser);
router
  .route("/:id")
  .get(UserControllers.getSingleUser)
  .patch(UserControllers.updateUser)
  .delete(UserControllers.deleteUser);

module.exports = router;
