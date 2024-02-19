import { Router } from "express";
import { helthcheck } from '../controllers/healthcheck.controller.js'

const router = Router()

router.route("/").get(helthcheck)

export default router 