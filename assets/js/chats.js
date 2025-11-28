function logout() {
    window.location.href = '/logout'
}

function login() {
    window.location.href = '/login'
}

function opretChat() {
    window.location.href = '/opretChat'
}
async function getChats() {
    const response = await fetch('/api/chats/')
    return response.json()
}

async function initChats() {
    const chats = await getChats()
    for (let chat of chats) {
        const anchor = document.getElementById('chat' + chat.id)

        let toShow = `${chat.navn} (${chat.oprettelsesdato})`

        anchor.innerHTML = toShow
    }
}

initChats()