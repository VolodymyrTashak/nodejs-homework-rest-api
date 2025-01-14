const Joi = require('joi');

const addContactSchema = Joi.object({
    name: Joi.string().alphanum().min(3).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    phone: Joi.string().min(3).required(),
});

const updateContactSchema = Joi.object({
    name: Joi.string().alphanum().min(3).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    phone: Joi.string().min(3).required(),
    favorite: Joi.boolean().truthy('false'),
});

module.exports = {
    addContactSchema,
    updateContactSchema,
}