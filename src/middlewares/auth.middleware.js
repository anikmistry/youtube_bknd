import { apiError} from "../utils/apiError.js"
import { asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

export const verifyJWT = asyncHandler(async(req,res,next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authoraization")?.replace("Bearer ","")

        if(!token) throw new apiError(401,"Unauthorized requist");
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id)select("-password -refereshToken")

        if(!user) throw new apiError(401,"Invalid access token");
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.massage || "invalid access token")
    }
})