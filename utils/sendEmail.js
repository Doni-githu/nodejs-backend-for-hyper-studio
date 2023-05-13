const nodemailer = require('nodemailer')
module.exports = async function (email, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            service: "gmail",
            port: 587,
            secure: true,
            auth: {
                user: 'ddonierov96@gmail.com',
                pass: 'cofdvlcjnvmhcosl',
            }
        })

        const info = await transporter.sendMail({
            from: 'ddonierov96@gmail.com',
            to: email,
            subject,
            text
        })
        console.log('Successfuly')
    } catch (error) {
        console.log('Failur', error)
    }
}