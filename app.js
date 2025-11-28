import express from 'express'
import session from 'express-session'
import fs from 'node:fs/promises'
import {chat, message} from './chat.js'

const app = express();
const userAmount = 3;
app.set("view engine", "pug");
app.use(express.static("assets"));
app.use(express.json());
app.use("/images", express.static("images"));

app.use(
    session({
        secret: "82CE19E6-1E02-450C-B71F-E29393A209BA",
        resave: true,
        saveUninitialized: true
    }))

async function loadUser(path) {
    try {
        const data = await fs.readFile(path, { encoding: "utf8" });
        return data.json();
    } catch (error) {
        console.log(error);
    }
}

async function loadAllUsers() {
    try {
        const content = await fs.readdir("./users");
        let users = [];
        for (let index = 0; index < content.length; index++) {
            const data = await fs.readFile("./users/" + content[index], {
                encoding: "utf8",
            });
            const user = JSON.parse(data);
            users[user.id] = user;
        }
        return users;
    } catch (error) {
        console.log(error);
    }
}

let users = await loadAllUsers();

app.get("/", async (request, response) => {
    if (request.session.ok) {
        //console.log(JSON.stringify(request.session))
        response.render("frontpage", {
            title: "Chatten",
            bruger: request.session.username,
            userlevel: request.session.userlevel,
        });
    } else {
        response.render("login");
    }
});

async function findBruger(brugernavn) {
    //console.log("findBruger: "+ users)
    for (let user of users) {
        if (brugernavn === user.brugernavn) return user;
    }
    console.log(brugernavn + " ikke fundet");
    return "bruger ikke fundet";
}

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", async (request, response) => {
    const brugernavn = request.body.username;

    if (request.session.ok == "undefined" || brugernavn == "undefined") {
        response.render("login");
    }
    try {
        const bruger = await findBruger(brugernavn);
        //console.log("LoginPost: " + users)
        if (users.includes(bruger)) {
            const password = request.body.password;
            if (bruger.password === password) {
                request.session.ok = true;
                request.session.username = brugernavn;
                request.session.userlevel = bruger.brugerniveau;
                response.status(201).send({ ok: true });
            } else {
                response.sendStatus(401);
            }
        } else {
            response.sendStatus(401);
        }
    } catch (error) {
        response.sendStatus(401); //Unauthorized
    }
});

app.get('/opretUser', (request, response) => {
    if (request.session.userlevel == '3')
        response.render('opretUser')
    else
        response.sendStatus(401)
})

app.get("/logout", (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            response.redirect("/");
        }
    });
});

async function getAllChats() {
    const chatNames = await fs.readdir("./chats");
    const chats = [];
    for (let chatName of chatNames) {
        chats.push(JSON.parse(await fs.readFile("./chats/" + chatName)));
    }
    return chats;
}

app.get("/chats", async (request, response) => {
    const userlevel = request.session.userlevel;

    if (userlevel < 1 || userlevel > 3) {
        response.sendStatus(401); //Unauthorized
    } else {
        const chats = await getAllChats();
        response.send(JSON.stringify(chats));
    }
});

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

app.post('/api/chats/:chatId/:beskedId', async (request, response) => {
    const chatID = request.params.chatId
    const beskedID = request.params.beskedId

    const nyBesked = request.body.besked

    console.log(`modtog post request på chat: ${chatID}, besked: ${beskedID}, tekst: ${nyBesked}`)

    const data = await fs.readFile('./chats/' + chatID + '.json')
    let chat

    if (data == 'undefined') {
        console.log('chat ikke fundet')
        response.sendStatus(404)
    } else {
        chat = JSON.parse(data)
        let beskedToEdit = null
        let lastID = -1

        for (let besked of chat.beskeder) {
            lastID = besked.id
            if (besked.id == beskedID) {
                beskedToEdit = besked
                besked.besked = nyBesked
                break
            }
        }
        if (beskedToEdit == null) {
            //todo lav tilhørsforhold
            chat.beskeder.push(new message(lastID + 1, nyBesked, request.session.username, ""))
        }
        await fs.writeFile(`./chats/${chatID}.json`, JSON.stringify(chat))
        response.status(201).send({ ok: true })

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
            await fs.writeFile(`./chats/${chatID}.json`, JSON.stringify(chat))
        }
    }
})



app.post('/opretUser', async (request, response) => {
    try {
        const allUsers = await fs.readdir('./users')

        const newUser = {
            id: allUsers.length,
            brugernavn: request.body.brugernavn,
            password: request.body.password,
            oprettelsesdato: request.body.oprettelsesdato,
            brugerniveau: request.body.brugerniveau
        }

        await fs.writeFile(`./users/${newUser.brugernavn}.json`, JSON.stringify(newUser))

        users = await loadAllUsers()

        console.log(users)

        response.status(201).send({ ok: true })

    } catch (err) {
        response.sendStatus(err)
    }
})

app.get("/users", async (request, response) => {
  if (request.session.userlevel == "3") {
    try {
      const usersFolder = await fs.readdir("./users");
      let allUsers = [];
      for (let userFile of usersFolder) {
        const data = await fs.readFile("./users/" + userFile, {
          encoding: "utf8",
        });
        const user = JSON.parse(data);
        allUsers.push(user);
      }
      response.render("seUser", { users: allUsers });
    } catch (err) {
      response.sendStatus(err);
    }
  } else {
    response.sendStatus(401);
  }
});

app.get("/users/:username", async (request, response) => {
  if (request.session.userlevel == "3") {
    const username = request.params.username;
    try {
      const data = await fs.readFile(`./users/${username}.json`, {
        encoding: "utf8",
      });
      const user = JSON.parse(data);
      response.render("userDetaljer", { user });
    } catch (err) {
      console.log(err);
      response.sendStatus(404);
    }
  } else {
    response.sendStatus(401);
  }
});

app.get("/api/users/:username/chats", async (request, response) => {
  if (request.session.userlevel == "3") {
    const username = request.params.username;
    try {
      const allChats = await getAllChats();
      const userChats = allChats.filter((chat) => {
        return chat.beskeder.some((besked) => besked.ejer === username);
      });
      response.json(userChats);
    } catch (err) {
      console.log(err);
      response.sendStatus(500);
    }
  } else {
    response.sendStatus(401);
  }
});

app.listen(9090, () => {
    console.log("Listening on port 9090");
});
