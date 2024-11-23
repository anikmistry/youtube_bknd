import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import { json } from "express";

const generateAccessAndRefereshTokens = async(userId) =>
{
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()
        console.log("refreshtoken",refereshToken)
        user.refereshToken = refereshToken;
        console.log("baler matha",user)
        await user.save({ validateBeforeSave : false })
        console.log(user)
        return {accessToken, refereshToken}
    } catch (error) {
        throw new apiError(500,"your are fucked up while generating access token and referesh token")
    }
}

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

const loginUser = asyncHandler(async (req,res) =>{
    //get email/username and password from frontend
    //validation(this user is register or not)
    //check password
    //create access token and refresh token
    //send cookie
    const {email,username,password} = req.body;
    console.log(email)
    if(!email && !username){
        throw new apiError(400,"Email or username is require")
    }
    const user = await User.findOne({
        $or: [{email},{username}]
    })
    if(!user) throw new apiError(404,"user does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) throw new apiError(401,"Invalid user password");

    const {accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser,accessToken,refereshToken
            },
            "user loggedIn successfully"
        )
    )
    
})

const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refereshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new apiResponse(200,{}, "user logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res) =>  {
    const incomingRefreshToken = req.cookies.refereshToken || req.body.refereshToken
    if(!incomingRefreshToken) throw new apiError(401,"unauthorized requist");


    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user) throw new apiError(401,"invalid refresh token");
        if(incomingRefreshToken !== user?.refereshToken) throw new apiError(401,"refresh token used or expired");
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken,newRefereshToken}=await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newRefereshToken)
        .json(
            new apiResponse(
                200,
                {
                    accessToken,
                    refereshToken: newRefereshToken
                },
                "access token refreshed "
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message || "invalid refresh token")
    }
})

const changePassword = asyncHandler(async(req,res) =>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) throw new apiError(400,"invalid old password");

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "password changed successfully"
        )
    )
})

const currentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            req.user,
            "current user fetched successfully"
        )
    )
})

const updateAccoutDetails = asyncHandler(async(req,res) =>{
    const {fullName, email } = req.body
    if(!fullName && !email){
        throw new apiError(400,"requir fields")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName : fullName,
                email: email
            }
            
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "successfully name or email is updated"
        )
    )
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avaterLocalPath = req.file?.path

    if(!avaterLocalPath) throw new apiError(400,"avatar file is missing");

    const avatar = await uploadCloudinary(avaterLocalPath)

    if(!avatar.url) throw new apiError(400,"error while uploading");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar : avatar.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "avatar image updated successfully"
        )
    )

})

const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) throw new apiError(400,"cover image file is missing");

    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if(!coverImage.url) throw new apiError(400,"error while uploading cover image");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage : coverImage.url
            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "avatar image updated successfully"
        )
    )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    currentUser,
    updateAccoutDetails,
    updateUserAvatar,
    updateUserCoverImage

};