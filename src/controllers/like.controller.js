import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from '../models/like.model.js'
import mongoose from "mongoose";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const condition = { likedBy: req.user?._id, video: videoId }
    const like = await Like.findOne(condition)
    if (!like) {
        const createLike = await Like.create(condition)
        if (!createLike) {
            throw new ApiErrors(400, "Did not like something went wrong ")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Liked successfully"))
    }
    else {
        const deleteLike = await Like.findOneAndDelete(condition)
        if (!deleteLike) {
            throw new ApiErrors(400, "Did not get the like")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Liked removed successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const condition = { likedBy: req.user?._id, comment: commentId }
    const like = await Like.findOne(codition)
    if (!like) {
        const createLike = await Like.create(condition)
        if (!createLike) {
            throw new ApiErrors(400, "Did not like something went wrong ")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Liked successfully"))
    }
    else {
        const deleteLike = await Like.findOneAndDelete(condition)
        if (!deleteLike) {
            throw new ApiErrors(400, "Did not get the like")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Liked removed successfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const condition = { likedBy: req.user?._id, tweets: tweetId }
    const like = await Like.findOne(condition)
    if (!like) {
        const createLike = await Like.create(condition)
        if (!createLike) {
            throw new ApiErrors(400, "Did not like something went wrong ")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Liked successfully"))
    }
    else {
        const deleteLike = await Like.findOneAndDelete(condition)
        if (!deleteLike) {
            throw new ApiErrors(400, "Did not get the like")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Liked removed successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const getAllLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                videos: {
                    $first: "$videos"
                }
            }
        }
    ])

    if (!getAllLikedVideos) {
        new ApiErrors(404, "Liked not found ")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, getAllLikedVideos, "Fetched all liked videos successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}