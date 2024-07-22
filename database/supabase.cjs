const { createClient, auth } = require('@supabase/supabase-js')
const axios = require('axios')
require("dotenv").config()

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

// async function testConnect() {
//     let res = await supabase.auth.signInWithPassword({
//         email: 'joebailey1000@hotmail.co.uk',
//         password: 'Tayl0rSeahamH4ll!',
//     })

//     const { data, error } = await supabase
//         .from('Reviews')
//         .select('*')

//     console.log('data', data)
//     console.log('error', error)
// }

collectReviews()

module.exports={collectReviews}
// process.env.POSTGRESQL_PUBLIC
// process.env.POSTGRESQL_SECRET
// process.env.POOLER
// process.env.DB_URL