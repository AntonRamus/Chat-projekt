import express, { response } from "express";
import session from "express-session";
import fs from "node:fs/promises";
import chatsRouter from "./chatsRouter.js";
import usersRouter from "./usersRouter.js";

const app = express();
app.set("view engine", "pug");
app.use(express.static("assets"));
app.use(express.json());
app.use("/images", express.static("images"));

app.use(
  session({
    secret: "82CE19E6-1E02-450C-B71F-E29393A209BA",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(chatsRouter);
app.use(usersRouter);

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
      users.push(user); // Use push instead of indexing by ID to avoid sparse array
    }
    return users;
  } catch (error) {
    console.log(error);
  }
}

async function getAllChats() {
  try {
    const chatNames = await fs.readdir("./chats");
    const chats = [];
    for (let chatName of chatNames) {
      const data = await fs.readFile("./chats/" + chatName, {
        encoding: "utf8",
      });
      chats.push(JSON.parse(data));
    }
    return chats;
  } catch (error) {
    console.log(error);
    return [];
  }
}

let users = await loadAllUsers();

app.get("/", async (request, response) => {
  if (request.session.ok) {
    console.log(`Landing page - User: ${request.session.username}, Level: ${request.session.userlevel} (type: ${typeof request.session.userlevel})`);

    if (request.session.userlevel == 1 || request.session.userlevel == 2) {
      console.log("Rendering chats page");
      const chats = await getAllChats();
      response.render("chats.pug", {
        title: "chat siden",
        chats: chats,
        bruger: request.session.username,
        userlevel: request.session.userlevel,
      });
    } else {
      console.log("Rendering frontpage");
      response.render("frontpage", {
        title: "Chatten",
        bruger: request.session.username,
        userlevel: request.session.userlevel,
      });
    }
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
    // Reload users to get any newly created users
    users = await loadAllUsers();
    console.log(`Login attempt for: ${brugernavn}`);
    console.log(`Loaded ${users.length} users`);

    const bruger = await findBruger(brugernavn);
    console.log(`Found user:`, bruger);

    // Check if user was found (bruger is an object, not the error string)
    if (bruger && typeof bruger === "object" && bruger.brugernavn) {
      const password = request.body.password;
      console.log(`User found, checking password...`);
      if (bruger.password === password) {
        console.log(`Password correct, logging in with level ${bruger.brugerniveau}`);
        request.session.ok = true;
        request.session.username = brugernavn;
        request.session.userlevel = bruger.brugerniveau;
        response.status(201).send({ ok: true });
      } else {
        console.log(`Password incorrect`);
        response.sendStatus(401);
      }
    } else {
      console.log(`User not found`);
      response.sendStatus(401);
    }
  } catch (error) {
    console.error("Login error:", error);
    response.sendStatus(401); //Unauthorized
  }
});

app.get("/logout", (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      response.redirect("/");
    }
  });
});

app.listen(9090, () => {
  console.log("Listening on port 9090");
});
