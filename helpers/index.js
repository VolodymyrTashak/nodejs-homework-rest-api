const nodemailer = require("nodemailer");
// const { EMAIL_USER, EMAIL_PASS } = process.env;

function tryCatchWrapper(endpointFn) {
    return async(req, res, next) => {
        try {
            await endpointFn(req, res, next);
        } catch (error) {
            return next(error);
        }
    };
}


async function sendMail({ to, subject, html }) {

  const email = {
    from: "info@gmail.com",
    to,
    subject,
    html,
};

const transport = nodemailer.createTransport({
 host: "sandbox.smtp.mailtrap.io",
 port: 2525,
 auth: {
   user: "4a45088100af30",
   pass: "531834c36441c8",
 }
});

await transport.sendMail(email);

}

module.exports = {
    tryCatchWrapper,
    sendMail,
}