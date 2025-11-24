import express from 'express'
import session from 'express-session'
import fs from 'node:fs/promises'

const app = express()
app.set('view engine', 'pug')
app.use(express.static('assets'))
app.use(express.json())
app.use('/images', express.static('images'))

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

app.get('/', async (request, response) => {
    if (request.session.ok) {
        //console.log(JSON.stringify(request.session))
        response.render('frontpage', { title: 'Chatten', bruger: request.session.username, userlevel: request.session.userlevel })
    } else {
        response.render('login')
    }
})

async function findBruger(brugernavn) {
    for (let user of users) {
        if (brugernavn === user.brugernavn)
            return user
    }
    console.log(brugernavn + ' ikke fundet')
    return 'bruger ikke fundet'
}

app.get('/login', (request, response) => {
    response.render('login')
})



app.post('/login', async (request, response) => {
    const brugernavn = request.body.username

    if (request.session.ok == 'undefined' || brugernavn == 'undefined') {
        response.render('login')
    }
    try {
        const bruger = await findBruger(brugernavn)
        if (users.includes(bruger)) {
            const password = request.body.password
            if (bruger.password === password) {
                request.session.ok = true
                request.session.username = brugernavn
                request.session.userlevel = bruger.brugerniveau
                response.status(201).send({ ok: true })
            } else {
                response.sendStatus(401)
            }
        } else {
            response.sendStatus(401)
        }
    } catch (error) {
        response.sendStatus(401) //Unauthorized
    }

})

app.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            response.redirect('/');
        }
    });
}
);

async function getAllChats() {
    const chatNames = await fs.readdir('./chats')
    const chats = []
    for (let chatName of chatNames) {
        chats.push(JSON.parse(await fs.readFile('./chats/' + chatName)))
    }
    return chats
}

app.get('/chats', async (request, response) => {
    const userlevel = request.session.userlevel

    if (userlevel < 1 || userlevel > 3) {
        response.sendStatus(401) //Unauthorized
    } else {
        const chats = await getAllChats()
        response.send(JSON.stringify(chats))
    }
})

app.get('/chats/:id', async (request, response) => {
    const idToGet = request.params.id
    const userlevel = request.session.userlevel
    if (userlevel == 'undefined') {
        response.redirect('/login')
    }
    if (userlevel < 1 || userlevel > 3) {
        response.sendStatus(401) //Unauthorized
    } else {
        const chats = await getAllChats()
        let requestedChat = null
        for (let chat of chats) {
            if (chat.id == idToGet) {
                requestedChat = chat
                break
            }
        }
        if (requestedChat == null) {
            response.sendStatus(404)
        } else {
            const chatnavn = requestedChat.navn
            response.render('chat', { title: chatnavn, bruger: request.session.username, userlevel: request.session.userlevel, chat: requestedChat })
        }
    }
})

app.get('/api/chats/:id', async (request, response) => {
    const idToGet = request.params.id
    const userlevel = request.session.userlevel
    if (userlevel < 1 || userlevel > 3) {
        response.sendStatus(401) //Unauthorized
    } else {
        const chats = await getAllChats()
        let requestedChat = null
        for (let chat of chats) {
            if (chat.id == idToGet) {
                requestedChat = chat
                break
            }
        }
        if (requestedChat == null) {
            response.sendStatus(404)
        } else {
            const chatnavn = requestedChat.navn
            response.send(JSON.stringify(requestedChat))
        }
    }
})

app.delete('/api/chats/:chatId/:beskedId', async (request, response) => {
    const chatID = request.params.chatId
    const beskedID = request.params.beskedId

    console.log('modtog delete request på chat: ' + chatID + ', besked: ' + beskedID)


    const data = await fs.readFile('./chats/' + chatID + '.json')
    let chat

    if (data == 'undefined') {
        console.log('chat ikke fundet')
        response.sendStatus(404)
    } else {
        chat = JSON.parse(data)
        let beskedToDelete = null
        for (let besked of chat.beskeder) {
            if (besked.id == beskedID) {
                beskedToDelete = besked
                break
            }
        }
        if (beskedToDelete == null) {
            console.log('besked ikke fundet')
            response.sendStatus(404)
        } else {
            chat.beskeder = chat.beskeder.filter((besked => {
                return besked.id != beskedID
            }))
        }
    }



})

app.listen(9090, () => {
    console.log('Listening on port 9090')
})