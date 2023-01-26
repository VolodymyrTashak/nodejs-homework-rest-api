const { Users } = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

async function register(req, res, next) {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
  
    try {
      const avatarURL = gravatar.url(email);
      const savedUser = await Users.create({
        email,
        password: hashedPassword,
        avatarURL,
      });
      res.status(201).json({
          user: {
            email,
            subscription: savedUser.subscription,
          },
      });
    } catch (error) {
      if (error.message.includes("E11000 duplicate key error")) {
        return res.status(409).json({ message: "Email in use" });
      }
      return error;
    }
  }

  async function login(req, res, next) {
    const { email, password } = req.body;

    const storedUser = await Users.findOne({ email });

    if (!storedUser) {
      return res.status(401).json({ message: "Email is wrong" });
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
    updateAvatar,
  };