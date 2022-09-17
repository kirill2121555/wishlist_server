const nodemailer = require('nodemailer')

class MailService {
    async sendActivationMail(to, link) {
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.mail.ru",
                port: 465,
                secure: true,
                auth: {
                    user: 'soninnomok@mail.ru',
                    pass: 'rHykDd6idG0vTv5Gfyuz'
                },
            });

            let info = await transporter.sendMail({
                from: 'soninnomok@mail.ru',
                to: to,
                subject: "Hi",
                text: "Podtverdi akaynt",
                html: `
                    <div>
                        <b>Activation url</b><br>
                        <a href="${link}">${link}</a>
                    </div>`
            });
        } catch (e) {
        }
    }

    

    
}
module.exports = new MailService();