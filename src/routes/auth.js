
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkAuthorization = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', checkAuthorization, authController.changePassword);
router.get('/profile', checkAuthorization, authController.getProfile);
router.post('/send-otp', checkAuthorization, authController.sendOtp);
router.post('/verify-otp', checkAuthorization, authController.verifyEmailOtp);
router.post('/send-email-otp', checkAuthorization, authController.changeEmail);
router.post('/send-email-otp', checkAuthorization, authController.changeEmail);
router.post('/verify-email-otp', checkAuthorization, authController.verifyNewEmailOtp);
router.post('/verify-password', checkAuthorization, authController.verifyOtp);
router.post('/sendotp-email', checkAuthorization, authController.emailVerifiedSendOtp);
router.post('/verified-email', checkAuthorization, authController.verifiedEmailOtp);
router.post('/logout', authController.logout);

module.exports = router;



//PROTECTED

// router.get("/protected", (req, res) => {
//   const token = req.cookies.token;
//   if (!token) {
//   return res.status(404).json({ message: "No token avalible" });
//   }

//   try {
//     const decode = jwt.verify(token, process.env.SECRET_KEY);
//     res.status(200).json({ message:" User Logged In ", user: decode});
//   } catch (error) {
//     return res.status(500).json({ message:"Unauthenticated  tokken"});
//   }
// });



// LOGOUT
// router.post("/logout", async (req, res) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "User logged out!" });
// });



// GET

// router.get("/user", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json({users , message:" User Show Sucessfully "});
//   } catch (error) {
//     return res.status(500).json({ message:" No User  " , error});
//   }
// });
// module.exports = router;


//GET PROFILE

// router.get("/profile", async (req, res) => {
//   const token = req.cookies.token;
//   const decode = jwt.verify(token , process.env.SECRET_KEY)
//   const email = decode.email;
//   const users = await User.find({email: email});
//   res.status(200).json({users , message:"Profile Display successfully"});
// });
// module.exports = router;

// UPDATE PROFILE

// router.put('/updateProfile/:id', async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const updatedUserData = req.body;
//           if (updatedUserData.password) {
//          updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
//         }
//         const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });
//         res.status(200).json({ user: updatedUser, message: "Profile updated successfully" });
//     } catch (error) {
//         res.status(400).json(error);
//     }
// });


