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
    const allUsers = await fs.readdir("./users");

    const newUser = {
      id: allUsers.length,
      brugernavn: request.body.brugernavn,
      password: request.body.password,
      oprettelsesdato: request.body.oprettelsesdato,
      brugerniveau: request.body.brugerniveau,
    };

    await fs.writeFile(
      `./users/${newUser.brugernavn}.json`,
      JSON.stringify(newUser)
    );

    response.status(201).send({ ok: true });
  } catch (err) {
    response.sendStatus(err);
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
