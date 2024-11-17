import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videosSchema = new mongoose.Schema({
    id:{
        type: String,
        require: true
    },
    videoFile:{
        type: String,
        require: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title:{
        type: String,
        require: true
    },
    desciption:{
        type: String
    },
    duration:{
        type: Number,
        require: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        require: true
    },

},{timestamp: true})

videosSchema.plugin(mongooseAggregatePaginate)

export const Videos = mongoose.model("Videos", videosSchema)