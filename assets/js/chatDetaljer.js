const seChatsBtn = document.getElementById("seChatsBtn");
const chatList = document.getElementById("chatList");

seChatsBtn.onclick = async () => {
  const chats = await getChatsForBruger(brugernavn);
  visChats(chats);
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
