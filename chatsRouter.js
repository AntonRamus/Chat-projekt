import express, { response } from "express";
import fs from "fs/promises";
import { chat, message } from "./chat.js";

const router = express.Router();

let nextChatID;

async function getAllChats() {
  const chatNames = await fs.readdir("./chats");
  const chats = [];
  for (let chatName of chatNames) {
    chats.push(JSON.parse(await fs.readFile("./chats/" + chatName)));
  }
  return chats;
}

async function initChatID() {
  const chats = await getAllChats();
  nextChatID = parseInt(chats[chats.length - 1].id);
  nextChatID++;
  console.log(`nextChatID: ${nextChatID}`);
}

async function getNextChatID() {
  return nextChatID++;
}

// Initialize chat ID
initChatID();

router.get("/chats", async (request, response) => {
  const userlevel = request.session.userlevel;

  if (userlevel < 1 || userlevel > 3) {
    response.sendStatus(401); //Unauthorized
  } else {
    const chats = await getAllChats();
    response.render("chats", {
      title: "Chat siden",
      chats: chats,
      bruger: request.session.username,
      userlevel: request.session.userlevel,
    });
  }
});

router.get("/api/chats", async (request, response) => {
  const chats = await getAllChats();
  response.send(JSON.stringify(chats));
});

router.get("/opretChat", async (request, response) => {
  const userlevel = request.session.userlevel;

  if (userlevel == 2 || userlevel == 3) {
    response.render("opretChat", {
      title: "Opret chat",
      bruger: request.session.username,
    });
  } else {
    response.sendStatus(401); //Unauthorized
  }
});

router.post("/opretChat", async (request, response) => {
  const userlevel = request.session.userlevel;
  if (userlevel == 2 || userlevel == 3) {
    const id = await getNextChatID();
    const chatnavn = request.body.navn;
    const ejer = request.session.username;
    const chatbesked = request.body.besked;

    const nyChat = new chat(id, chatnavn, ejer);
    nyChat.addMessage(new message(0, chatbesked, ejer, "ejer"));
    console.log("ny chat:" + JSON.stringify(nyChat));

    try {
      await fs.writeFile(`./chats/${nyChat.id}.json`, JSON.stringify(nyChat));
      response.status(201).send({ ok: true });
    } catch (error) {
      console.log(error);
      response.status(500).send({ ok: false });
    }
  } else {
    response.sendStatus(401);
  }
});

router.get("/chats/:chatId/messages/:messageId", async (request, response) => {
  const chatId = request.params.chatId;
  const messageId = request.params.messageId;
  const userlevel = request.session.userlevel;

  if (userlevel == "undefined") {
    response.redirect("/login");
  }
  if (userlevel < 1 || userlevel > 3) {
    response.sendStatus(401); //Unauthorized
  } else {
    try {
      const data = await fs.readFile(`./chats/${chatId}.json`, {
        encoding: "utf8",
      });
      const chat = JSON.parse(data);

      // Find the specific message
      let requestedMessage = null;
      for (let besked of chat.beskeder) {
        if (besked.id == messageId) {
          requestedMessage = besked;
          break;
        }
      }

      if (requestedMessage == null) {
        response.sendStatus(404);
      } else {
        response.render("messageDetaljer", {
          title: "Besked Detaljer",
          bruger: request.session.username,
          userlevel: request.session.userlevel,
          message: requestedMessage,
          chat: chat,
        });
      }
    } catch (error) {
      console.log(error);
      response.sendStatus(404);
    }
  }
});

router.get("/chats/:id", async (request, response) => {
  const idToGet = request.params.id;
  const userlevel = request.session.userlevel;
  if (userlevel == "undefined") {
    response.redirect("/login");
  }
  if (userlevel < 1 || userlevel > 3) {
    response.sendStatus(401); //Unauthorized
  } else {
    const chats = await getAllChats();
    let requestedChat = null;
    for (let chat of chats) {
      if (chat.id == idToGet) {
        requestedChat = chat;
        break;
      }
    }
    if (requestedChat == null) {
      response.sendStatus(404);
    } else {
      const chatnavn = requestedChat.navn;
      response.render("chat", {
        title: chatnavn,
        bruger: request.session.username,
        userlevel: request.session.userlevel,
        chat: requestedChat,
      });
    }
  }
});

router.get("/api/chats/:id", async (request, response) => {
  const idToGet = request.params.id;
  const userlevel = request.session.userlevel;
  if (userlevel < 1 || userlevel > 3) {
    response.sendStatus(401); //Unauthorized
  } else {
    const chats = await getAllChats();
    let requestedChat = null;
    for (let chat of chats) {
      if (chat.id == idToGet) {
        requestedChat = chat;
        break;
      }
    }
    if (requestedChat == null) {
      response.sendStatus(404);
    } else {
      const chatnavn = requestedChat.navn;
      response.send(JSON.stringify(requestedChat));
    }
  }
});

router.post("/chats/ret/:chatId", async (request, response) => {
  const chatID = request.params.chatId;
  const userlevel = request.session.userlevel;
  if (userlevel == "undefined") {
    response.redirect("/login");
  }
  if (userlevel < 1 || userlevel > 3) {
    response.sendStatus(401); //Unauthorized
  } else {
    const chats = await getAllChats();
    let requestedChat = null;
    for (let chat of chats) {
      if (chat.id == chatID) {
        requestedChat = chat;
        break;
      }
    }
    if (requestedChat == null) {
      response.sendStatus(404);
    } else {
      const chatnavn = request.body.navn
      requestedChat.navn = chatnavn
      await fs.writeFile(`./chats/${chatID}.json`, JSON.stringify(requestedChat));
      response.status(201).send({ ok: true });
    }
  }
})

router.post("/api/chats/:chatId/:beskedId", async (request, response) => {
  const chatID = request.params.chatId;
  const beskedID = request.params.beskedId;

  const nyBesked = request.body.besked;

  console.log(
    `modtog post request på chat: ${chatID}, besked: ${beskedID}, tekst: ${nyBesked}`
  );

  const data = await fs.readFile("./chats/" + chatID + ".json");
  let chat;

  if (data == "undefined") {
    console.log("chat ikke fundet");
    response.sendStatus(404);
  } else {
    chat = JSON.parse(data);
    let beskedToEdit = null;
    let lastID = -1;

    for (let besked of chat.beskeder) {
      lastID = besked.id;
      if (besked.id == beskedID) {
        beskedToEdit = besked;
        besked.besked = nyBesked;
        break;
      }
    }
    if (beskedToEdit == null) {
      //todo lav tilhørsforhold
      chat.beskeder.push(
        new message(lastID + 1, nyBesked, request.session.username, "")
      );
    }
    await fs.writeFile(`./chats/${chatID}.json`, JSON.stringify(chat));
    response.status(201).send({ ok: true });
  }
});

router.delete("/api/chats/:chatId/:beskedId", async (request, response) => {
  const chatID = request.params.chatId;
  const beskedID = request.params.beskedId;

  console.log(
    "modtog delete request på chat: " + chatID + ", besked: " + beskedID
  );

  const data = await fs.readFile("./chats/" + chatID + ".json");
  let chat;

  if (data == "undefined") {
    console.log("chat ikke fundet");
    response.sendStatus(404);
  } else {
    chat = JSON.parse(data);
    let beskedToDelete = null;
    for (let besked of chat.beskeder) {
      if (besked.id == beskedID) {
        beskedToDelete = besked;
        break;
      }
    }
    if (beskedToDelete == null) {
      console.log("besked ikke fundet");
      response.sendStatus(404);
    } else {
      chat.beskeder = chat.beskeder.filter((besked) => {
        return besked.id != beskedID;
      });
      await fs.writeFile(`./chats/${chatID}.json`, JSON.stringify(chat));
    }
  }
});

router.delete("/api/chats/:chatId", async (request, response) => {
  const chatID = request.params.chatId;

  console.log(
    "modtog delete request på chat: " + chatID
  );

  const data = await fs.readFile("./chats/" + chatID + ".json");

  if (data == "undefined") {
    console.log("chat ikke fundet");
    response.sendStatus(404);
  } else {
    await fs.unlink("./chats/" + chatID + ".json");
    console.log("file deleted succesfully");
    response.ok == true;
    response.sendStatus(201);
  }
})

router.get("/chats/ret/:chatId", async (request, response) => {
  const chatID = request.params.chatId;
  const userlevel = request.session.userlevel;
  if (userlevel == "undefined") {
    response.redirect("/login");
  }
  if (userlevel < 1 || userlevel > 3) {
    response.sendStatus(401); //Unauthorized
  } else {
    const chats = await getAllChats();
    let requestedChat = null;
    for (let chat of chats) {
      if (chat.id == chatID) {
        requestedChat = chat;
        break;
      }
    }
    if (requestedChat == null) {
      response.sendStatus(404);
    } else {
      const chatnavn = requestedChat.navn;
      response.render("retChat", {
        title: chatnavn,
        bruger: request.session.username,
        chat: requestedChat,
      });
    }
  }
})

export default router;
