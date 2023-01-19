const { Contacts } = require("../models/contacts");

async function getContacts(req, res) {
  const contacts = await Contacts.find();
  res.status(200).json(contacts);
};

async function getContact(req, res, next) {
  const { contactId } = req.params;
  const contacts = await Contacts.findById(contactId);
  if (!contacts) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(300).json(contacts);
};

async function createContact(req, res, next) {
  const { name, email, phone, favorite } = req.body;
  const newContact = await Contacts.create({ name, email, phone, favorite });
  return res.status(201).json(newContact);
};

async function deleteContact(req, res, next) {
  const { contactId } = req.params;
  const contact = await Contacts.findById(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Not found" });
  }
  await Contacts.findByIdAndRemove(contactId);
  res.status(200).json(contact);
};

async function updateContacts(req, res, next) {
    const { contactId } = req.params;
    const body = req.body;
    const contact = await Contacts.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    if (!contact) {
        return res.status(400).json({ message: "Not found" });
    }
     return res.status(200).json(contact);
};

async function updateStatusContact(req, res, next) {
  const { contactId } = req.params;
  const body = req.body;
  if (!body) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  const contact = await Contacts.findByIdAndUpdate(contactId, body, {
    new: true,
  });

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
    updateStatusContact,
}
