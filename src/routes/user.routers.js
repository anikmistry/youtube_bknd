import { Router } from "express";
import { 
    loginUser,
    logoutUser, 
    registerUser,
    refreshAccessToken,
    changePassword,
    currentUser,
    updateAccoutDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistry
 } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/current-user").get(verifyJWT,currentUser)
router.route("/update-account").patch(verifyJWT,updateAccoutDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistry)

//anik is a good boy
//i am anik



export default router;