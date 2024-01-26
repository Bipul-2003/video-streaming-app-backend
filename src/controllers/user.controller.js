import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.models.js'
import { cloudinaryUpload } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import mongoose from 'mongoose'



const generationOfAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiErrors(500, 'Something went wrong while generating Access and Refresh tokens')
    }
}

const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(async (req, res) => {

    //taking the data 
    const { userName, email, password, fullName } = req.body
    console.log("userName", userName)

    //check for the empty filed recieved
    if ([userName, email, password, fullName].some((field) => field?.trim() === '')
    ) {
        throw new ApiErrors(400, 'All fields required')
    }
    //Chech for the existance of the user
    const existUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existUser) {
        throw new ApiErrors(409, 'User with same email or username exists')
    }

    //file existance check
    const avatarLocalFilePath = req.files?.avatar[0]?.path;
    // const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

    let coverImageLocalFilePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalFilePath = req.files.coverImage[0].path
    }

    if (!avatarLocalFilePath) {
        throw new ApiErrors(400, 'Avatar is required')
    }

    //upload to cloudinary
    const avatar = await cloudinaryUpload(avatarLocalFilePath)
    const coverImage = await cloudinaryUpload(coverImageLocalFilePath)

    if (!avatar) {
        throw new ApiErrors(500, 'Avatar is not uploaded')
    }
    //create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    if (!createdUser) {
        throw new ApiErrors(500, 'Something went wrong while resistering the user')
    }
    //sending the success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User Registered Successfully')
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { userName, email, password } = req.body

    if (!(userName || email)) {
        throw new ApiErrors(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (!user) {
        throw new ApiErrors(401, 'User not Exist')
    }
    const validPassword = await user.isPasswordCorrect(password)

    if (!validPassword) {
        throw new ApiErrors(401, 'Incorrect Password')
    }

    const { accessToken, refreshToken } = await generationOfAccessAndRefreshToken(user._id)

    const loggdinUser = await User.findById(user._id).select('-password -refreshToken')



    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggdinUser,
                    accessToken,
                    refreshToken
                },
                'Loggedin Successful')
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )



    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User Logged Out'))

})

//generating new access and refresh tokens
const generatingNewAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiErrors(401, 'Unauthorized Request')
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiErrors(400, 'Invalid Refresh Token')
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiErrors(400, 'Invalid Refresh Token')
        }
        const { refreshToken, accessToken } = await generationOfAccessAndRefreshToken(user._id)



        return res
            .status(200)
            .cookie('accessToken', options)
            .cookie('refreshToken', options)
            .json(
                new ApiResponse(200, { refreshToken, accessToken }, 'Access Token Refreshed')
            )

    } catch (error) {
        throw new ApiErrors(400, error?.message || "invalid refreshToken")
    }


})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiErrors(401, "Invalid Password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user")
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!(fullName || email)) {
        throw new ApiErrors(401, "All fileds required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details update Successful"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLoacalPath = req.file?.path
    if (!avatarLoacalPath) {
        throw new ApiErrors(400, "Avetar file is required")
    }
    const avatar = await cloudinaryUpload(avatarLoacalPath)
    if (!avatar.url) {
        fs.unlinkSync(avatarLoacalPath)
        throw new ApiErrors(400, "Avetar file is not uploaded")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLoacalPath = req.file?.path
    if (!coverImageLoacalPath) {
        throw new ApiErrors(400, "Cover-Image file is required")
    }
    const coverImage = await cloudinaryUpload(coverImageLoacalPath)
    if (!coverImage.url) {
        fs.unlinkSync(coverImageLoacalPath)
        throw new ApiErrors(400, "Cover-Image file is not uploaded")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover-Image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params
    if (!userName?.trim()) {
        throw new ApiErrors(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        elese: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])
    if (!channel?.length) {
        throw new ApiErrors(404, "Channel doesn't exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
})

const watchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    if (!user) {
        throw new ApiErrors(404, "User not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Watch History found successfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    generatingNewAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile
}