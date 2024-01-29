import mongoose from 'mongoose'
import { Video } from '../models/video.models.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { cloudinaryUpload } from '../utils/cloudinary.js'


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const sortOption = {}
    if (sortBy) {
        sortOption[sortBy] = sortType == "desc" ? -1 : 1
    }
    let basequery = {}


    if (query) {
        basequery.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ]
    }
    const allVideos = await Video.aggregate([
        {
            $match: {
                ...basequery,
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: sortOption
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
    ])
    if (!allVideos) {
        throw new ApiErrors(400, "videos not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allVideos), "Videos featched successfully")
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body


    if (!title || !description) {
        throw new ApiErrors(400, "Title and desc. is requiered")
    }
    const videolocalPath = req.files?.videofile[0]?.path
    const thumbaillocalPath = req.files?.thumbail[0]?.path

    if (!videolocalPath || !thumbaillocalPath) {
        throw new ApiErrors(400, "Video file and thumbail is required")
    }

    const cloudVideoPath = await cloudinaryUpload(videolocalPath)
    const cloudThumbailPath = await cloudinaryUpload(thumbaillocalPath)

    if (!cloudVideoPath || !cloudThumbailPath) {
        throw new ApiErrors(500, "Video file and thumbail is not uploaded ")
    }
    const createVideo = await Video.create({
        videoFile: cloudVideoPath.url,
        thumbail: cloudThumbailPath.url,
        title,
        description,
        duration: cloudVideoPath.duration,
        owner: req.user?._id
    })

    const video = await createVideo.save()
    if (!video) {
        throw new ApiErrors(400, "Video is not published")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video published Successfully"))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiErrors(400, "Video id required")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiErrors(404, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const { title, description } = req.body

    if (!title && !description) {
        throw new ApiErrors(400, "Title and desc. is requiered")
    }
    const thumbaillocalPath = req.files?.path
    if (!thumbaillocalPath) {
        throw new ApiErrors(400, "Thumbail is required")
    }
    const cloudThumbailPath = await cloudinaryUpload(thumbaillocalPath)
    if (!cloudThumbailPath) {
        throw new ApiErrors(500, "Thumbail is not uploaded")
    }
    const video = await Video.findById(
        videoId,
        {
            $set: {
                thumbail: cloudThumbailPath.url,
                title,
                description
            }
        },
        { new: true }
    )

    if (!video) {
        throw new ApiErrors(400, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiErrors(404, "Video not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiErrors(404, "video not found")
    }
    const toggledStatus = video.isPublished === true ? false : true
    video.isPublished = toggledStatus
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Publish status updated successfully"))

})

export {
    getAllVideos,
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    updateVideo,
    publishAVideo
}