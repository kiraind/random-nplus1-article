const http  = require('http')
const fetch = require('node-fetch')

if(!process.argv[2]) {
    throw new Error('please specify port')
}

const port = parseInt(process.argv[2], 10)

function random(from, to) {
    return from + Math.floor( Math.random() * (to - from + 1) )
}

async function getRandomLink() {
    const now = new Date()
    const thisYear  = now.getFullYear()
    const thisMonth = now.getMonth() + 1

    const year = random( 2015, thisYear )
    let month

    if(year === 2015) {
        month = random( 3, 12 )
    } else if(year === thisYear) {
        month = random( 1, thisMonth )
    } else {
        month = random( 1, 12 )
    }

    month = month.toString(10).padStart(2, '0')

    const query = `https://nplus1.ru/news/${year}/${month}`

    const res = await fetch(query)
    const body = await res.text()

    const links = body
        .match(/"\/news\/.*\/.*\/.*\/[a-z0-9-]+"/g)
        .map(s => 'https://nplus1.ru' + s.slice(1, -1))

    if(links.length === 0) {
        // retry
        return await getRandomLink()
    }

    return links[ random(0, links.length - 1) ]
}

http.createServer(async function (request, response) {
    const link = await getRandomLink()

    response.writeHead(302, {
        'Location': link
    })

    response.end()
}).listen( port )