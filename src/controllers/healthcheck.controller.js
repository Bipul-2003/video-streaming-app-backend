import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const helthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "The system is healthy"))
})

export {
    helthcheck
}