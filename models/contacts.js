const fs = require('fs/promises');
const path = require("path");
const { nanoid } = require("nanoid");
const contactsPath = path.resolve(__dirname, "./contacts.json"); 

const listContacts = async () => {
  const contactsRaw = await fs.readFile(contactsPath);
    const db = JSON.parse(contactsRaw);
    return db;
};

const getContactById = async (contactId) => {
  const db = await listContacts();
    const currentContact = db.find((contact) => contact.id === contactId);
    return currentContact;
};

const removeContact = async (contactId) => {
  const db = await listContacts();
  const updateContacts = db.filter((contact) => contact.id !== contactId.toString());
  await fs.writeFile(contactsPath, JSON.stringify(updateContacts, null, 2));
};

const addContact = async (name, email, phone) => {
  const id = nanoid();
  const contact = { id, name, email, phone };
    const db = await listContacts();
    db.push(contact);
    await fs.writeFile(contactsPath, JSON.stringify(db, null, 2));
};

const updateContact = async (contactId, body) => {
  const db = await listContacts();
  db.forEach((contact) => {
    if (contact.id === contactId.toString()) {
      contact.name = body.name;
      contact.email = body.email;
      contact.phone = body.phone;
    }
  });
  await fs.writeFile(contactsPath, JSON.stringify(db, null, 2));
  return db.find((contact) => contact.id === contactId);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
