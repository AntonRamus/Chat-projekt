import express, { response } from "express";
import fs from "fs/promises";
import { chat, message } from "./chat.js";

const router = express.Router();

async function getAllChats() {
  const chatNames = await fs.readdir("./chats");
  const chats = [];
  for (let chatName of chatNames) {
    chats.push(JSON.parse(await fs.readFile("./chats/" + chatName)));
  }
  return chats;
}

router.get("/opretUser", (request, response) => {
  if (request.session.userlevel == "3") response.render("opretUser");
  else response.sendStatus(401);
});

router.post("/opretUser", async (request, response) => {
  try {
    // Load all existing users to find the highest ID
    const usersFolder = await fs.readdir("./users");
    let maxId = -1;
    for (let userFile of usersFolder) {
      const data = await fs.readFile("./users/" + userFile, {
        encoding: "utf8",
      });
      const user = JSON.parse(data);
      if (user.id > maxId) {
        maxId = user.id;
      }
    }

    const newUser = {
      id: maxId + 1, // Use next available ID
      brugernavn: request.body.brugernavn,
      password: request.body.password,
      oprettelsesdato: request.body.oprettelsesdato,
      brugerniveau: parseInt(request.body.brugerniveau),
    };

    console.log("Creating new user:", newUser);

    await fs.writeFile(
      `./users/${newUser.brugernavn}.json`,
      JSON.stringify(newUser)
    );

    console.log(`User ${newUser.brugernavn} created successfully with ID ${newUser.id}`);
    response.status(201).send({ ok: true });
  } catch (err) {
    console.error("Error creating user:", err);
    response.sendStatus(500);
  }
});

router.get("/users", async (request, response) => {
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

router.get("/users/:username", async (request, response) => {
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

router.get("/users/:id/messages", async (request, response) => {

  if(request.session.userlevel == "3"){
    const userId = request.params.id;
    try{
      // Find user by ID from all user files
      const usersFolder = await fs.readdir("./users");
      let user = null;
      for (let userFile of usersFolder) {
        const data = await fs.readFile("./users/" + userFile, {
          encoding: "utf8",
        });
        const userData = JSON.parse(data);
        if (userData.id == userId) {
          user = userData;
          break;
        }
      }

      if (!user) {
        response.sendStatus(404);
        return;
      }

      // Get all chats and collect messages from this user
      const allChats = await getAllChats();
      const chatBeskeder = [];
      for (let chat of allChats) {
        for (let besked of chat.beskeder) {
          if (besked.ejer === user.brugernavn) {
            // Add chat info to the message
            const beskedWithChat = {
              ...besked,
              chatNavn: chat.navn,
              chatId: chat.id
            };
            chatBeskeder.push(beskedWithChat);
          }
        }
      }

      response.render("usersMessages", { user, chatBeskeder });
    }catch(err){
      console.log(err);
      response.sendStatus(404);
    }
  } else{
    response.sendStatus(401)
  }

});

router.get("/api/users/:username/chats", async (request, response) => {
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

export default router;
