const { Users } = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { sendMail } = require("../helpers/index");
const { nanoid } = require("nanoid");

async function register(req, res, next) {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
  
    try {
      const avatarURL = gravatar.url(email);
      const verificationToken = nanoid();

      const savedUser = await Users.create({
        email,
        password: hashedPassword,
        avatarURL,
        verificationToken,
      });

      res.status(201).json({
          user: {
            email,
            subscription: savedUser.subscription,
          },
          message: "Verification email sent",
      });

      const mail = {
        to:email,
        subject: "Please confirm your email",
        html: `<a href="localhost:3000/users/verify/${verificationToken}">Confirm your email</a>`,
      };
      await sendMail(mail);
    } catch (error) {
      if (error.message.includes("E11000 duplicate key error")) {
        return res.status(409).json({ message: "Email in use" });
      }
      next();
      return error;
    }
  }

  async function login(req, res, next) {
    const { email, password } = req.body;

    const storedUser = await Users.findOne({ email });

    if (!storedUser) {
      return res.status(401).json({ message: "Email is wrong" });
    }

    if (!storedUser.verify) {
      return res.status(400).json({ message: "Email is not verified!" });
    }

    const isPasswordValid = await bcrypt.compare(password, storedUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is wrong" });
    }

    const payload = { id: storedUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
        token,
        user: {
          email,
          subscription: storedUser.subscription,
        },
    });
  }

  async function logout(req, res, next) {
    const { _id } = req.body;
    const logUser = await Users.findByIdAndUpdate(_id, { token: null });
    console.log(logUser);
    return res.status(204).json({ message: "No Content"});
  }


  async function current(req, res, next) {
    const { user } = req;
    const { email, subscription } = user;
    console.log("user", user);
    return res.status(200).json({ 
      email,
      subscription,
    });
  }

  async function verifyEmail(req, res, next) {
    const { verificationToken } = req.params;
    const user = await Users.findOne({
      verificationToken,
    });

    if(!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    await Users.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    })

    return res.status(200).json({
      message: "Verification successful"
    })
  }

  async function verify(req, res, next) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "missing required field email",
      })
    }

    const user = await Users.findOne({
      email,
    });

    if (!user.verify) {
      const verificationToken = nanoid();
      const mail = {
        to:email,
        subject: "Please confirm your email",
        html: `<a href="localhost:3000/users/verify/${verificationToken}">Confirm your email</a>`,
      };

      await sendMail(mail);
      return res.status(200).json({
        message: "Verification email sent",
      })
    }
    res.status(400).json({
      message: "Verification has already been passed",
    })
  }

  // async function updateSubscription(req, res, next) {
  //   try {
  //     const { subscription } = req.body;
  //     const { _id } = req.user;
  //     const update = await Users.findByIdAndUpdate(_id, subscription, {
  //       new: true,
  //     });
  //     if (!update) {
  //       return res.status(404).json({ message: "Not found" });
  //     }
  //     return res.status(201).json({ user: {
  //       ok: true,
  //       subscription: update.subscription,
  //     }, 
  //     message: "Success"});
  //   } catch (error) {
  //     next(error.message);
  //   }
  // }

  async function updateAvatar(req, res, next) {
    const { originalname } = req.file;
    const tmpPath = req.file.path;
    const { _id } = req.user;
    const imageName = `${_id}_${originalname}`;
    const image = await Jimp.read(tmpPath);
    await image.resize(250, 250);

    try {
       const avatarsDir = path.join(__dirname, "../", "public", "avatars");
       const result = path.join(avatarsDir, imageName);
       await fs.rename(tmpPath, result);
       const avatarURL = path.join("avatars", imageName);
       console.log(avatarURL);
      await Users.findByIdAndUpdate(req.user._id, { avatarURL });
      res.status(200).json({
        avatarURL: avatarURL,
      });
    } catch (error) {
      await fs.unlink(tmpPath);
      next(error);
    }
  }

  module.exports = {
    register,
    login,
    logout,
    current,
    verifyEmail,
    verify,
    updateAvatar,
  };