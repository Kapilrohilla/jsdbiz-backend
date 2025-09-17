const router = require('express').Router();
const CountriesController = require('../../controllers/CountriesController');
const upload = require('../../utils/upload');

router.get('/', CountriesController.listCountries);
router.post('/seed', CountriesController.seed);
router.post('/', upload.single('flag'), CountriesController.create);
router.put('/:id', upload.single('flag'), CountriesController.update);
router.delete('/:id', CountriesController.remove);

module.exports = router;


