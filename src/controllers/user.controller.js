import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async (req, res) =>{
    //get user deatails from frontend
    //validation - not empy
    // check if images, check for avatar
    // upload them to cloudinary, avater
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {email, fullName, username, password}=req.body
    if([email, fullName, username, password].some((field)=>
    field?.trim()==="" ) ){
        throw new apiError(400, "All fields are required")
    }
    

    const existerdUser =await User.findOne({
        $or: [{ email }, { username }]
    })
    if(existerdUser) throw new apiError(409,"this user is existing")
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new apiError(400,"avater is fucking require")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400,"avater is require")
    }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new apiError(500,"error from user register")
    }
    return res.status(201).json(
        new apiResponse(200,createdUser,"User register successfully")
    )
    
})



export {registerUser};