const nodemailer = require('nodemailer')
module.exports = async function (email, subject, text) {
    return new Promise(async (resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                service: "gmail",
                port: 587,
                secure: true,
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                }
            })

            const info = await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject,
                html: text
            })
            resolve(info)
        } catch (error) {
            reject(error)
        }
    })
}