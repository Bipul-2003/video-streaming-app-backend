import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from '../controllers/comments.controllers.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").get(deleteComment).post(updateComment)

export default router
