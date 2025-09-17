const router = require('express').Router();
const controller = require('../../controllers/VisaApplicationsController');
const appDocsController = require('../../controllers/ApplicationDocumentsController');
const auth = require('../../utils/auth');
const upload = require('../../utils/upload');

router.post('/', auth.isAuthunticated, controller.create);
router.put('/:id', auth.isAuthunticated, controller.update);
router.delete('/:id', auth.isAuthunticated, controller.remove);
router.get('/', auth.isAuthunticated, controller.getAllVisaApplications);


// Upload single file with field name 'file' and body { type }
router.post('/:visaApplicationId/documents', auth.isAuthunticated, upload.single('file'), appDocsController.upload);
// List documents for a visa application
router.get('/:visaApplicationId/documents', auth.isAuthunticated, appDocsController.list);

module.exports = router;


