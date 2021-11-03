import Router from 'express'
import statsController from '../controllers/statsController.js';

const statsRouter = new Router()

statsRouter.get('/getMaxChanges', statsController.getMaxBalance)

export default statsRouter