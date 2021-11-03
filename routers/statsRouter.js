import {Router} from 'express'
import statsController from "../controllers/statsController.js";

const statsRouter = Router()

statsRouter.get('/getMaxChanges', statsController.getMaxBalance)

export {statsRouter}