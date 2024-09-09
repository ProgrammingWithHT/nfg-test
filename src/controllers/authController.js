const bcrypt = require("bcryptjs");
const User = require("../models/auth");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For generating random OTP
const transporter = require("../config/mail/mailconfig");
const { CleanHTMLData, CleanDBData } = require("../config/database/sanetize");
const logger = require('../helpers/logger'); // Import the logger
const ip = require('ip');

var company_name = "AlgoX";
const emailImagesLink =
  "https://threearrowstech.com/projects/gdsg/public/images/email-images/";
const noreply_email = "mails@elevatedmarketplace.world";

// Register a new user
exports.register = async (req, res) => {
  const postData = req.body;
  const name = CleanHTMLData(CleanDBData(postData.name.trim()));
  const email = CleanHTMLData(CleanDBData(postData.email.trim()));
  const password = CleanHTMLData(CleanDBData(postData.password.trim()));
  const affiliateCodenumber = CleanHTMLData(
    CleanDBData(postData.affiliateCodenumber)
  );

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password length and content
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and contain both numbers and letters",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      logger.error({
        userid: user._id,
        hostname: ip.address() || null,
        userAgent: req.headers['user-agent'] || null,
      }, `User already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user with emailotp field set to null
    const userData = new User({
      name,
      email,
      password: hashedPassword,
      emailotp: null,
      affiliateCodenumber: affiliateCodenumber,
    });
    const user = await userData.save();
    logger.info({
      userid: user._id,
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, `User registered successfully!: ${email}`);
    res.status(200).json({ message: "User registered successfully!", user });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(400).json({ message: "User cannot be registered", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      logger.error({
        userid: null,
        hostname: ip.address() || null,
        userAgent: req.headers['user-agent'] || null,
      }, `Login attempt failed for email: ${email}`);

      return res.status(404).json({ message: "Wrong Email" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      logger.error({
        userid: user._id,
        hostname: ip.address() || null,
        userAgent: req.headers['user-agent'] || null,
      }, `Login attempt failed for email: ${email}`);

      return res.status(404).json({ message: "Wrong Password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Set the token in a cookie
    res.cookie("token", token, { httpOnly: true });
    
    // Log successful login
    logger.info({
      userid: user._id,
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, `User Logged in successfully: ${email}`);

    res.status(200).json({ message: "User logged in!", token });

  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.logout = async (req, res) => {
  try {
    const user = req.body; 
    
    logger.info({
      userid: user._id,
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, `User logged out successfully ${user.email}`);

    res.status(200).json({ message: "User logged out successfully!" });
  } catch (error) {
    logger.error({
      message: error.message,
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, "Error during logout");

    res.status(500).json({ message: "Error during logout", error });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(400).json({ message: "Error fetching user profile", error });
  }
};

exports.changePassword = async (req, res) => {
  const postData = req.body;
  const oldPassword = CleanHTMLData(CleanDBData(postData.oldPassword));
  const newPassword = CleanHTMLData(CleanDBData(postData.newPassword));
  const confirmPassword = CleanHTMLData(CleanDBData(postData.confirmPassword));

  // Validate input
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "New password and confirmation do not match" });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      message: "New password cannot be the same as the old password.",
    });
  }

  if (
    newPassword.length < 8 ||
    !/\d/.test(newPassword) ||
    !/[a-zA-Z]/.test(newPassword)
  ) {
    return res.status(400).json({
      message:
        "New password must be at least 8 characters long and contain both numbers and letters",
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatched = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatched) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Generate OTP and set expiration time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailotp = otp;
    user.otpExpiresAt = new Date(Date.now() + 53 * 1000); // Set expiration time to 53 seconds from now
    await user.save();
    logger.info({
      userid: user._id,
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, `OTP generated and saved successfully ${user.email} `);
    res
      .status(200)
      .json({ message: "OTP generated and saved successfully", otp });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({ message: "Error changing password", error });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp: passwordotp, newPassword,email } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if OTP is valid and not expired
    if (user.emailotp === passwordotp) {
      if (new Date() > user.otpExpiresAt) {
        return res
          .status(400)
          .json({ success: false, message: "OTP has expired" });
      }

      user.password = await bcrypt.hash(newPassword, 8);
      user.emailotp = ""; // Clear the OTP
      user.otpExpiresAt = null; // Clear the OTP expiration time
      await user.save();
      logger.info({
        userid: user._id,
        hostname: ip.address() || null,
        userAgent: req.headers['user-agent'] || null,
      }, `Password changed successfully ${user.email}`);
      return res
        .status(200)
        .json({ success: true, message: "Password changed successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    logger.error({ message: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

exports.changeEmail = async (req, res) => {
  const postData  = req.body;
  const newEmail = CleanHTMLData(CleanDBData(postData.newEmail));

  if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
    return res.status(400).json({
      message: "Please provide a valid new email address",
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res
        .status(400)
        .json({ message: "This email is already in use by another account" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.newEmail = newEmail;
    user.newEmailOtp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    console.log(`Generated OTP: ${otp}`);
    logger.info({
      userid: user._id,
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, `OTP generated and sent to the new email${newEmail} `);
    res
      .status(200)
      .json({ message: "OTP generated and sent to the new email", otp });
  } catch (error) {
    logger.error({ message: error.message });
    res.status(500).json({ message: "Error changing email", error });
  }
};

exports.verifyNewEmailOtp = async (req, res) => {
  const postData = req.body;
  const emailotp = CleanHTMLData(CleanDBData(postData.emailotp));
  const newEmail = CleanHTMLData(CleanDBData(postData.newEmail));

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.newEmailOtp === emailotp) {
      if (new Date() > user.otpExpiresAt) {
        return res
          .status(400)
          .json({ success: false, message: "OTP has expired" });
      }

      user.email = newEmail;
      user.newEmailOtp = null;
      user.otpExpiresAt = null;
      user.varifiedemailotp = null; //
      await user.save();
      logger.info({
        userid: user._id,
        hostname: ip.address() || null,
        userAgent: req.headers['user-agent'] || null,
      }, `Email changed successfully ${newEmail}`);
      return res
        .status(200)
        .json({ success: true, message: "Email changed successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in verifyNewEmailOtp:", error);
    logger.error({ message: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const title = "OTP - Password Reset";
    const username = user.name;
    const email = user.email;
    const emailimg = emailImagesLink + "passwordreset.png";
    const heading = "OTP For Password Reset";
    const subheading = "";
    const body = `Hello ${username},<br>You have requested a password reset on ${company_name} App. <b>${otp}</b> is your OTP for the request<br>`;

    const mailOptions = {
      from: {
        name: "AlgoX",
        address: noreply_email,
      },
      to: {
        name: username,
        address: email,
      },
      subject: "OTP - Password Reset AlgoX " + company_name,
      html: emailTemplate(title, emailimg, heading, subheading, body),
      text: "This is the plain text version of the email content",
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (!err) {
        user.varifyemailotp = otp;
        await user.save();
       
        return res
          .status(200)
          .json({ success: true, message: "OTP sent successfully", otp });
      } else {
        res.status(400).json({
          status: "error",
          message: "Failed to send email",
        });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  const { emailVerifyOtp } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;

    const user = await User.findOne({ _id: userId });
    console.log("Varification email otp", user.varifyemailotp);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.varifyemailotp === emailVerifyOtp) {
      user.varifyemailotp = "verified";
      await user.save();
     
      return res
        .status(200)
        .json({ success: true, message: "Email verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

exports.emailVerifiedSendOtp = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save the OTP to the varifyemailotp field in the database
    user.varifiedemailotp = otp;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", otp });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

exports.verifiedEmailOtp = async (req, res) => {
  const { emailVerifiedOtp } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Match the OTP with the varifyemailotp field
    if (user.varifiedemailotp === emailVerifiedOtp) {
      // Mark email as verified
      user.varifiedemailotp = "verified";
      await user.save();
      logger.info({
        userid: user._id,
        hostname: ip.address() || null,
        userAgent: req.headers['user-agent'] || null,
      }, `Email verified successfully ${user.email}`);
      return res
        .status(200)
        .json({ success: true, message: "Email verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

// exports.changePassword = async (req, res) => {

//   const { oldPassword, newPassword, confirmPassword } = req.body;

//   // Validate input
//   if (!oldPassword || !newPassword || !confirmPassword) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   if (newPassword !== confirmPassword) {
//     return res
//       .status(400)
//       .json({ message: "New password and confirmation do not match" });
//   }
// if(oldPassword === newPassword) {
//   return res.status(400).json({
//     message:
//       "New password cannot be the same as the old password.",
//   });
// }
//   if (
//     newPassword.length < 8 ||
//     !/\d/.test(newPassword) ||
//     !/[a-zA-Z]/.test(newPassword)
//   ) {
//     return res.status(400).json({
//       message:
//         "New password must be at least 8 characters long and contain both numbers and letters",
//     });
//   }

//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const passwordMatched = await bcrypt.compare(oldPassword, user.password);
//     if (!passwordMatched) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     user.emailotp = otp;
//     await user.save();

//     res
//       .status(200)
//       .json({ message: "OTP generated and saved successfully", otp });
//   } catch (error) {
//     res.status(500).json({ message: "Error changing password", error });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   const { otp: passwordotp, newPassword } = req.body;

//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "No token provided" });
//   }

//   try {
//     const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//     const userId = decodedToken.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }
//     if (user.emailotp === passwordotp) {
//       user.password = await bcrypt.hash(newPassword, 8);
//       user.emailotp = ""; // Clear the OTP
//       await user.save();

//       return res
//         .status(200)
//         .json({ success: true, message: "Password changed successfully" });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error });
//   }
// };

// exports.changeEmail = async (req, res) => {
//   const { newEmail } = req.body;
//   if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
//     return res.status(400).json({
//       message: "Please provide a valid new email address",
//     });
//   }

//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const emailExists = await User.findOne({ email: newEmail });
//     if (emailExists) {
//       return res
//         .status(400)
//         .json({ message: "This email is already in use by another account" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     user.newEmail = newEmail;
//     user.newEmailOtp = otp;
//     await user.save();

//     console.log(`Generated OTP: ${otp}`);

//     res
//       .status(200)
//       .json({ message: "OTP generated and sent to the new email", otp });
//   } catch (error) {
//     res.status(500).json({ message: "Error changing email", error });
//   }
// };

// exports.verifyNewEmailOtp = async (req, res) => {
//   const { emailotp, newEmail } = req.body;
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "No token provided" });
//   }

//   try {
//     const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//     const userId = decodedToken.id;

//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     if (user.newEmailOtp === emailotp) {
//       user.email = newEmail;
//       user.varifyemailotp = null

//       await user.save();
//       return res
//         .status(200)
//         .json({ success: true, message: "Email changed successfully" });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error in verifyNewEmailOtp:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };
