const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.postTransaction);
router.delete('/:id', transactionController.removeTransaction);

module.exports = router;
