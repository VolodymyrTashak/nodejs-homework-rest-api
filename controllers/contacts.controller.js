const { listContacts, getContactById, addContact, removeContact, updateContact, } = require ("../models/contacts");
// const { nanoid } = require("nanoid");


async function getContacts(req, res, next) {
  const contacts = await listContacts();
  res.status(200).json(contacts);
};

async function getContact(req, res, next) {
  const { contactId } = req.params;
  const contacts = await getContactById(contactId);
  if (!contacts) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(300).json(contacts);
};

async function createContact(req, res, next) {
  // const id = nanoid();
  const { name, email, phone } = req.body;
  const newContact = await addContact( name, email, phone);
  return res.status(201).json(newContact);
};

async function deleteContact(req, res, next) {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Not found" });
  }
  await removeContact(contactId)
  res.status(200).json(contact);
};

async function updateContacts(req, res, next) {
    const { contactId } = req.params;
    const body = req.body;
    const contact = await updateContact(contactId, body);
    if (!contact) {
        return res.status(400).json({ message: "Not found" });
    }
     return res.status(200).json(contact);
};

module.exports = {
    getContacts,
    getContact,
    createContact,
    deleteContact,
    updateContacts,
}
