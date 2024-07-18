const express = require("express")
const app = express()
const nodemailer = require('nodemailer')
const axios = require('axios')
require('dotenv').config()

app.use(express.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
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


app.get("/not-found", (req, res) => res.status(404).send("Not Found"))

app.get("/", (req, res) => res.send("Express"))

app.post('/mail', async (req, res) => {

    const {email, name, number, comments, preApprove} = req.body
    
    let mailOptions = {
        from: 'taylorhall.message@gmail.com',
        to: 'enquiries@taylor-hall.co.uk',//,"david@evanstmd.plus.com"
        subject: `${preApprove ? "Pre-Approval Request" : "Customer Enquiry" }: ${name}`,
        html: `<p>Customer Name: ${name}</p>
    <br/><p>Customer Email: ${email}</p>
    <br/><p> Customer Phone Number: ${number}</p>
    ${comments === "" ? "" : `<br/><p>Comments: ${comments}</p>`}`
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
// comment
app.get('/reviews', (req, res)=>{
  axios.get('https://places.googleapis.com/v1/places/ChIJM09GQ_dgfkgRPFJsTLkMmFE?key=AIzaSyAIxD9aaF2hOPX62rTBM62pXqMKOSVDQ3Q',{
    headers:{
      'X-Goog-FieldMask': 'rating,reviews,userRatingCount'
    }
  })
    .then(({data})=>res.send(data).status(200))
    .catch((err)=>res.send(err).status(400))
})

app.listen(3001, () => console.log("Server ready on port 3001"))

module.exports = app
