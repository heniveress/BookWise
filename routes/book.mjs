
import express from 'express';
import * as userController from '../controllers/userController.mjs';
import * as bookController from '../controllers/bookController.mjs';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const router = express.Router();


router.all(['/:bookId/edit', '/insert'],
  userController.isAuth);

router.get('/find', bookController.find);
router.post('/find', bookController.postFind);

router.get('/insert', bookController.getInsertForm);
router.post('/insert', upload.single('boritokep'), bookController.postInsertForm);

router.get('/:bookId/remove', bookController.removeBook);

router.get('/', bookController.bookListPage);
router.get('/:bookId', bookController.bookDetailsPage);

router.get('/:bookId/edit', bookController.getEditForm);
router.post('/:bookId/edit', bookController.postEditForm);

router.get('/:bookId/edit', bookController.getEditForm);
router.post('/:bookId/edit', bookController.postEditForm);


