const express = require("express")
const app = express()
const nodemailer=require('nodemailer')
require('dotenv').config()

app.get("/", (req, res) => res.send("Express"))

app.post('/mail',(req,res)=>{

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    port:465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENTSECRET,
      refreshToken: process.env.OAUTH_REFRESHTOKEN
    }
  });

  let mailOptions = {
    from: 'taylorhall.message@gmail.com',
    to: 'joeybailey1000@gmail.com',
    subject: 'test email',
    text: 'test email test email'
  };

  transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent successfully");
    }
  });
})

app.listen(3001, () => console.log("Server ready on port 3001"))

module.exports = app