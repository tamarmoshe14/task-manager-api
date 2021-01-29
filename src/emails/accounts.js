const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
    to: email,
    from: 'tamarmoshe14@gmail.com',
    subject: 'Welcome to the Task App',
    text: `Hi ${name}, thanks for signing up to our app. Enjoy!`
    })
}

const sendCancelEmail = (email, name) =>{
    sgMail.send({
    to: email,
    from: 'tamarmoshe14@gmail.com',
    subject: 'We are sorry to see you leave',
    text: `Hi ${name}, Is there anything we could have done to keep you on board?`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}