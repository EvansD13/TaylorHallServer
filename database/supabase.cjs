const { createClient, auth } = require('@supabase/supabase-js')
const axios = require('axios')
require("dotenv").config()
//comment
const supabase = createClient(process.env.DB_URL, process.env.POSTGRESQL_PUBLIC)

async function collectReviews() {
  let res = await supabase.auth.signInWithPassword({
    email: 'joebailey1000@hotmail.co.uk',
    password: 'Tayl0rSeahamH4ll!',
  })
  return axios.get('https://places.googleapis.com/v1/places/ChIJM09GQ_dgfkgRPFJsTLkMmFE?key=AIzaSyAIxD9aaF2hOPX62rTBM62pXqMKOSVDQ3Q', {
    headers: {
      'X-Goog-FieldMask': 'rating,reviews,userRatingCount'
    }
  })
    .then(({ data }) => {

      let parsedReviews = data.reviews.map((e) => {
        return {
          author: e.authorAttribution.displayName,
          body: e.text.text,
          img_url: e.authorAttribution.photoUri,
          rating: e.rating,
          upload_date: e.publishTime
        }
      })

      return Promise.all([
        supabase
          .from('Reviews')
          .select('body'),
        parsedReviews
      ])

    }).then(([{ data, error }, parsedReviews]) => {

      return supabase
        .from('Reviews')
        .insert(parsedReviews.filter((e) => {
          return !data.some((f) => f.body === e.body
          )
        }))

    })
    .catch((err) => console.log(err))
  x
}

async function deliverReviews() {
  let res = await supabase.auth.signInWithPassword({
    email: 'joebailey1000@hotmail.co.uk',
    password: 'Tayl0rSeahamH4ll!',
  })
  let reviews = await supabase
    .from('Reviews')
    .select('*')
    .eq('rating', 5)
    .not('body', 'is', null)
    .order('id', { random: false })
  
  let userRatingCount = reviews.data.length
  let rating = reviews.data.reduce((acc,curr)=>acc+curr.rating,0)/reviews.data.length

  let returnReviews = []
  for (let i = 0; i < 5; i++) {
    let index = Math.floor(Math.random() * reviews.data.length)
    returnReviews.push(reviews.data[index])
    reviews.data.splice(index, index + 1)
  }

  returnReviews.forEach(relativiseDate)
  return {
    rating,
    reviews:returnReviews,
    userRatingCount
  }
}

function relativiseDate(e) {
  let timeStamps = [3600000, 3600000 * 24, 3600000 * 24 * 7, 3600000 * 24 * 30, 3600000 * 24 * 365, Infinity]
  let diff = Date.now() - new Date(e.upload_date)
  let denomIndex = timeStamps.indexOf(
    timeStamps.find((e,i,a) => e < diff && a[i+1]>diff)
  )
  let denom
  let quantifier
  let returnString
  switch (denomIndex) {
    case 0:
      denom = 'hour'
      break
    case 1:
      denom = 'day'
      break
    case 2:
      denom = 'week'
      break
    case 3:
      denom = 'month'
      break
    case 4:
      denom = 'year'
      break
    default:
      returnString='An hour ago'
  }
  if (returnString) return returnString

  quantifier = Math.floor(diff / timeStamps[denomIndex])
  if (quantifier === 1) {
    if (denom === 'hour') returnString = 'An hour ago'
    else returnString = 'A '+denom+' ago'
  } else {
    returnString = `${quantifier} ${denom}s ago`
  }

  e.upload_date = returnString
}

deliverReviews()

module.exports = { collectReviews, deliverReviews }
// process.env.POSTGRESQL_PUBLIC
// process.env.POSTGRESQL_SECRET
// process.env.POOLER
// process.env.DB_URL
