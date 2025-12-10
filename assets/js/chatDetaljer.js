const seChatsBtn = document.getElementById("seChatsBtn");
const chatList = document.getElementById("chatList");
const seAlleBeskeder = document.getElementById("beskeder");

seChatsBtn.onclick = async () => {
  const chats = await getChatsForBruger(brugernavn);
  visChats(chats);
};

seAlleBeskeder.onclick = async () => {
  try {
    const response = await fetch(`/users/${id}/messages`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({brugernavn})
    });
    return await response.json();
  } catch (error) {
    console.error("Fejl ved hentning af chats:", error);
    return [];
  }
};

async function getChatsForBruger(brugernavn) {
  try {
    const response = await fetch(`/api/users/${brugernavn}/chats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Fejl ved hentning af chats:", error);
    return [];
  }
}

function visChats(chats) {
  chatList.replaceChildren([]);
  if (chats.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ingen chats fundet for denne bruger";
    chatList.appendChild(li);
    return;
  }
  for (let chat of chats) {
    const chatDOM = document.createElement("a");
    const li = document.createElement("li");
    li.appendChild(chatDOM);
    chatList.appendChild(li);
    const id = chat.id;
    const navn = chat.navn;
    const ejer = chat.ejer;
    const dato = chat.oprettelsesdato;
    const length = chat.beskeder.length;

    chatDOM.innerHTML =
      "(" + id + ")" + navn + " (" + ejer + ", " + dato + "(" + length + "))";
    chatDOM.href = "/chats/" + id;
  }
}
