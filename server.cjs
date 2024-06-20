const express = require("express")
const app = express()
const nodemailer = require('nodemailer')
require('dotenv').config()

app.use(express.json())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://taylor-hall-server-bailey-and-evans-web-solutions.vercel.app/mail",);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
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


app.get("/", (req, res) => res.send("Express"))

app.post('/mail', (req, res) => {

    const customer = {
        email: req.body.email,
        name: req.body.name,
        number: req.body.number,
        comments: req.body.comments
    }
    console.log(customer)

    let mailOptions = {
        from: 'taylorhall.message@gmail.com',
        to: 'david@evanstmd.plus.com',
        subject: `Customer Enquiry: ${customer.name}`,
        html: `<p>Customer Name: ${customer.name}</p>
    <br/><p>Customer Email: ${customer.email}</p>
    <br/><p> Customer Phone Number: ${customer.number}</p>
    ${customer.comments === "" ? "" : `<br/><p>Comments: ${customer.comments}</p>`}`
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent successfully");
            res.status(200).json(data)
        }
    });
})

app.listen(3001, () => console.log("Server ready on port 3001"))

module.exports = app