import express from 'express'
import session from 'express-session'
import fs from 'node:fs/promises'

const app = express()
app.set('view engine', 'pug')
app.use(express.static('assets'))
app.use(express.json())

app.use(session({
    secret: '82CE19E6-1E02-450C-B71F-E29393A209BA',
    resave: true,
    saveUninitialized: true
}))

async function loadUser(path) {
    try {
        const data = await fs.readFile(path, { encoding: 'utf8' })
        return data.json()
    } catch (error) {
        console.log(error)
    }
}

async function loadAllUsers() {
    try {
        const content = await fs.readdir('./users')
        let users = []
        for (let index = 0; index < content.length; index++) {
            const data = await fs.readFile('./users/' + content[index], { encoding: 'utf8' });
            const user = JSON.parse(data)
            users[user.id] = user
        }
        return users
    } catch (error) {
        console.log(error)
    }
}

const users = await loadAllUsers()

app.get('/', (request, response) => {
    const user = request.session.user
    if (user) {
        console.log(request.session.ok)
    } else {
        response.render('login')
    }
})

async function findBruger(brugernavn) {
    for (let user of users) {
        if (brugernavn === user.brugernavn)
            return user
    }
    return 'bruger ikke fundet'
}

app.post('/login', (request, response) => {
    const brugernavn = request.body.username

    if (request.session.ok == 'undefined' || brugernavn == 'undefined') {
        response.render('login')
    }
    try {
        const bruger = findBruger(brugernavn)
        console.log(bruger)
        if (users.includes(bruger)) {
            const password = request.body.password
            if (bruger.password === password) {
                request.session.isLoggedIn = true
                response.status(201).send({ ok: true })
            } else {
                response.sendStatus(401)
            }
        } else {
            response.sendStatus(402)
        }
    } catch (error) {
        response.sendStatus(403) //Unauthorized
    }

})

app.listen(9090, () => {
    console.log('Listening on port 9090')
})