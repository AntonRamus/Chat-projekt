function logout() {
    window.location.href = '/logout'
}

function login() {
    window.location.href = '/login'
}

function opretChat() {
    window.location.href = '/opretChat'
}

async function sletChat(chatID) {
    let apiCall = `/api/chats/${chatID}`;
    console.log("api call = " + apiCall)
    const response = await fetch(apiCall, {
        method: 'DELETE'
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json()
    })
        .then(data => {
            console.log('Delete successful:', data)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error)
        })
    console.log(response)
    window.location.href = `/chats`
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