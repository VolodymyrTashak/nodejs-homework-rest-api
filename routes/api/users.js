const express = require("express");
const { upload } = require("../../middlewares/upload");
const { register, login, logout, current, updateAvatar } = require("../../controllers/users.controller");
const { tryCatchWrapper} = require("../../helpers/index");
const { auth } = require("../../middlewares/index");

const authRouter = express.Router();

authRouter.post("/register", tryCatchWrapper(register));
authRouter.post("/login", tryCatchWrapper(login));
authRouter.post("/logout", tryCatchWrapper(auth), tryCatchWrapper(logout));
authRouter.get("/current", tryCatchWrapper(auth), tryCatchWrapper(current));
// authRouter.patch("/:id", tryCatchWrapper(auth), tryCatchWrapper(updateSubscription));
authRouter.patch("/avatars", upload.single("avatar"), auth, tryCatchWrapper(updateAvatar));
authRouter.use("/download", express.static("./tmp"));

module.exports = {
  authRouter,
};