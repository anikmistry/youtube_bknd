import mongoose, {Schema} from "mongoose";

const communityPostSchema = new Schema({
    content:{
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timeseries: true})

export const CommunityPost = mongoose.model("CommyunityPost",communityPostSchema)