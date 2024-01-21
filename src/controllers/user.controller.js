import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.models.js'
import { cloudinaryUpload } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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

export { registerUser }