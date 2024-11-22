import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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


export {
    registerUser,
    loginUser,
    logoutUser

};