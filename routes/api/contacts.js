const express = require('express');
const { tryCatchWrapper } = require("../../helpers/index");
const { getContacts, getContact, createContact, deleteContact, updateContacts, updateStatusContact } = require("../../controllers/contacts.controller");
const { validateBody } = require("../../middlewares/index");
const { addContactSchema, updateContactSchema } = require("../../schemas/contacts");

const router = express.Router();

router.get('/', tryCatchWrapper(getContacts));

router.get('/:contactId', tryCatchWrapper(getContact));

router.post('/', validateBody(addContactSchema), tryCatchWrapper(createContact));

router.delete('/:contactId', tryCatchWrapper(deleteContact));

router.put('/:contactId', validateBody(updateContactSchema), tryCatchWrapper(updateContacts));

router.patch('/:contactId/favorite', validateBody(updateContactSchema), tryCatchWrapper(updateStatusContact));

module.exports = router
