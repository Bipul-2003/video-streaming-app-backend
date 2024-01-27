import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        requred: true
    },
    description: {
        type: String,
        requred: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'   
    }
}, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)
