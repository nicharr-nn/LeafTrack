const transactionService = require('../services/transactionService');

async function getTransactions(req, res, next) {
  try {
    const transactions = await transactionService.listTransactions(req.query);
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
}

async function postTransaction(req, res, next) {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
}

async function removeTransaction(req, res, next) {
  try {
    await transactionService.deleteTransaction(
      req.params.id,
      req.query.user_id
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  postTransaction,
  removeTransaction
};
