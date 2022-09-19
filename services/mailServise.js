const nodemailer = require('nodemailer')

class MailService {
    async sendActivationMail(to, link) {
        console.log(to, link,process.env.USER)
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.mail.ru",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                },
            });

            let info = await transporter.sendMail({
                from: 'soninnomok@mail.ru',
                to: to,
                subject: "Hi",
                text: "Verify your account",
                html: `
                    <div>
                        <b>Activation url</b><br>
                        <a href="${link}">${link}</a>
                    </div>`
            });
        } catch (e) {
            console.log(e)
        }
    }

    

    
}
module.exports = new MailService();