import mongoose from 'mongoose'
import { Comment } from '../models/comment.models.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    try {
        if (!videoId?.trim()) {
            throw new ApiErrors(400, "Video id is requiered")
        }
        const allComments = await Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: parseInt(limit, 10)
            }
        ])

        return res
            .status(200)
            .json(new ApiResponse(200, allComments, "All comments feached successfully"))
    } catch (error) {
        throw new ApiErrors(400, error.mesage)
    }
})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params
    const userId = req.user._id

    if (!content || !videoId?.trim()) {
        throw new ApiErrors(401, "Content is required !")
    }
    const comment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(userId),
    })
    if (!comment) {
        throw new ApiErrors(400, "Comment is not created succcessfully")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment created successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if (!commentId?.trim()) {
        throw new ApiErrors(400, "Comment is requiered")
    }
    if (!content) {
        throw new ApiErrors(400, "New comment is required")
    }
    const modifiedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )
    if (!modifiedComment) {
        throw new ApiErrors(400, "Comment doesn't exists")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, modifiedComment, "Comment modified successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId?.trim()) {
        throw new ApiErrors(400, "Comment is requiered")
    }

    const commentDeleted = await Comment.findByIdAndDelete(
        commentId
    )

    if (!commentDeleted) {
        throw new ApiErrors(400, "Comment not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted Successfully"))

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}