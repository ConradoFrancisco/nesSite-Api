import express from 'express';
import { createNewsController } from '../controllers/NewsController.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';

const newsRouter = express.Router();

(async () => {
  const NewsController = await createNewsController();

  newsRouter.post('/', uploadMiddleware.array('images', 5), (req, res, next) => 
    NewsController.create(req, res, next));
  newsRouter.get('/', (req, res, next) => NewsController.getAll(req, res, next));
  newsRouter.delete('/:id', (req, res, next) => NewsController.deleteNew(req, res, next));
  newsRouter.delete('/images', (req, res, next) => NewsController.deleteImage(req, res, next));
  newsRouter.put('/:id/status', (req, res, next) => NewsController.setStateNew(req, res, next));
  newsRouter.get('/:id', (req, res, next) => NewsController.getById(req, res, next));
  newsRouter.put("/:id", uploadMiddleware.array("images", 5), NewsController.update);
})();

export default newsRouter;
