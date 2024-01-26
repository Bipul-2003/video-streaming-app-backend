import { Router } from "express";
import {
    changePassword,
    generatingNewAccessToken,
    getCurrentUser,
    getUserChannelProfile,
    loginUser,
    logoutUser,
    registerUser,
    updateAvatar,
    updateCoverImage,
    updateUserDetails,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)
router.route('/login').post(loginUser)


//secure routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(generatingNewAccessToken)

router.route('/change-password').post(verifyJWT, changePassword)
router.route('/current-user').post(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateUserDetails)
router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route('/c/:userName').get(verifyJWT, getUserChannelProfile)
router.route('/history').get(verifyJWT, getWatchHistory)


export default router