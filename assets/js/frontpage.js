const logout = document.getElementById('0')
const opretUser = document.getElementById('opretUser')
const seChats = document.getElementById('seChats')
const chatList = document.getElementById('chatList')

logout.onclick = async () => {
    //dårlig langsom løsning. fix hvis tid hihi
    window.location.href = '/logout'
}

seChats.onclick = async () => {
    let chats = await getChats().then(chats => visChats(chats))
}

opretUser.onclick = async () => {
    window.location.href = '/opretUser'
}

async function getChats() {
    const chats = await fetch('/chats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(function (response) {
        return response.json();
    })
    return chats
}

function visChats(chats) {
    chatList.replaceChildren([]) //clear the list by replacing children with empty array
    for (let chat of chats) {
        const chatDOM = document.createElement("a")
        const li = document.createElement("li")
        li.appendChild(chatDOM)
        chatList.appendChild(li)
        const id = chat.id
        const navn = chat.navn
        const ejer = chat.ejer
        const dato = chat.oprettelsesdato
        const length = chat.beskeder.length

        chatDOM.innerHTML = '(' + id + ')' + navn + ' (' + ejer + ', ' + dato + '(' + length + '))'
        chatDOM.href = '/chats/' + id
    }
}