import { v2 as cloudinary } from "cloudinary";


import fs from "fs"
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET 
     // Click 'View API Keys' above to copy your API secret
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){

            console.log("localFilePath is null")
            return null;
        } 
        console.log("local file path is")
        //upload the file on the cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file upload has been completed
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally seved file
        return null
    }
}

export {uploadCloudinary}