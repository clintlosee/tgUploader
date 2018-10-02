const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers')

// * Controllers
const uploadController = require('../controllers/uploadController')

router.get('/', catchErrors(uploadController.file))
router.get('/add', catchErrors(uploadController.file))
router.post('/add',
  uploadController.upload,
  catchErrors(uploadController.rework),
  catchErrors(uploadController.uploadFile)
)
router.get('/admin/deletealloftheuploadedfiles', catchErrors(uploadController.deleteFiles))
router.get('/admin/listuploadfiles', catchErrors(uploadController.listFiles))

module.exports = router;
