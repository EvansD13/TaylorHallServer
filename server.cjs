const express = require("express")
const app = express()
const nodemailer = require('nodemailer')
const axios = require('axios')
const cors = require("cors")
const { collectReviews, deliverReviews } = require('./database/supabase.cjs')
//
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

setInterval(collectReviews,3600000*24*7)

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

app.post('/mail', async (req, res) => {

  const { email, name, number, comments, preApprove } = req.body

  let mailOptions = {
    from: 'taylorhall.message@gmail.com',
    to: 'enquiries@taylor-hall.co.uk',//"david@evanstmd.plus.com"
    subject: `${preApprove ? "Pre-Approval Request" : "Customer Enquiry"}: ${name}`,
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
  })
})
// comment
app.get('/reviews', (req, res) => {
  
  deliverReviews()
    .then(({reviews,userRatingCount,rating})=>{
      res.set('Acces-Control-Allow-Origin','https://www.taylor-hall.co.uk')
      res.status(200).send({
        reviews: reviews.map(({author,body,upload_date,img_url,rating})=>{
          return {
            rating,
            text: {
              text: body
            },
            authorAttribution: {
              displayName: author,
              photoUri: img_url
            },
            relativePublishTimeDescription: upload_date
          }
        }),
        rating,
        userRatingCount
      })
    }).catch((err) => res.send(err).status(400))
})

app.listen(3001, () => console.log("Server ready on port 3001"))


app.get("/not-found", (req, res) => res.status(404).send("Not Found"))


module.exports = app



//comment



// let now = new Date()
// let nextMonday = new Date()
// nextMonday.setDate(d.getDate() + (((1 + 7 - d.getDay()) % 7) || 7))
// nextMonday.setHours(0)
// nextMonday.setMinutes(0)
// nextMonday.setSeconds(0)
// nextMonday.setMilliseconds(0)
// setTimeout(() => {
//   collectReviews()
//   setInterval(collectReviews,1000*60*60*24*7)
// }, nextMonday - now)



