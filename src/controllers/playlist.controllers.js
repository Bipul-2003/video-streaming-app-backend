import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from '../models/playlist.models.js'
import mongoose from "mongoose";




const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name && !description) {
        throw new ApiErrors(400, "Name and description requiered")
    }


    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id

    })
    if (!playlist) {
        throw new ApiErrors(400, "Playlist is not created")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist created successfully"))
})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiErrors(401, "Userid requiered")
    }

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if (!userPlaylists) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylists, "playlists found successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiErrors(401, "Userid requiered")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist found successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        { new: true }
    )
    if (!updatedPlaylist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to the Playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pop: {
                videos: videoId
            }
        },
        { new: true }
    )
    if (!updatedPlaylist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from the Playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const playlist = await Playlist.findByIdAndDelete(
        playlistId
    )
    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist removed successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        { new: true }
    )
    if (!updatedPlaylist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))


})


export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
    addVideoToPlaylist,
    getPlaylistById,
    getUserPlaylists,

}