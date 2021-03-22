const nodemailer = require('nodemailer');
require("dotenv").config();

module.exports = {
    sendMail: async function (address, subject, content) {
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        });
        console.log(process.env.EMAIL_USER,process.env.EMAIL_PASSWORD)
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"No Reply" <${process.env.EMAIL_USER}>`,
            to: {address},
            subject: {subject},
            text: "Hello world?",
            html: "<b>Hello world?</b>",
        });

        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}
