const express = require('express');
const Joi = require('joi');
const auth = require('../middlewares/auth');
const Customer = require('../models/customer');
const HttpError = require('../utils/http-error');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .required(),
  isGold: Joi.boolean(),
});

router.get('/', auth, async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send({ data: customers });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  let customer = await Customer.findOne({
    $or: [{ email: value.email }, { phone: value.phone }],
  });
  if (customer) {
    throw new HttpError(409, 'Customer already exists');
  }

  customer = await Customer.create({ ...value });
  res.send({ data: customer });
});

router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id },
    { ...value },
    { new: true }
  );
  if (!customer) {
    throw new HttpError(404, 'The customer with the given ID was not found.');
  }

  res.send({ data: customer });
});

router.delete('/:id', auth, async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id });
  if (!customer) {
    throw new HttpError(404, 'The customer with the given ID was not found.');
  }

  res.send({ data: customer });
});

router.get('/:id', auth, async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id });
  if (!customer) {
    throw new HttpError(404, 'The customer with the given ID was not found.');
  }

  res.send({ data: customer });
});

module.exports = router;
