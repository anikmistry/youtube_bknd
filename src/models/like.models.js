import mongoose from "mongoose"

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.objectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.objectId,
            ref: "Comment"
        },
        communityPost: {
            type: Schema.Types.objectId,
            ref: "CommunityPost"
        },
        likedBy: {
            type: Schema.Types.objectId,
            ref: "User"
        },   
    },{timestamps: true}
)

export const Like = mongoose.model("Like",likeSchema)