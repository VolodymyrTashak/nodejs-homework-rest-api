const { Users } = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function register(req, res, next) {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
  
    try {
      const savedUser = await Users.create({
        email,
        password: hashedPassword,
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

  module.exports = {
    register,
    login,
    logout,
    current,
  };