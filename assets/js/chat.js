async function getChat(id) {
    const chat = await fetch('/api/chats/' + id, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(function (response) {
        return response.json();
    })
    return chat
}

const chat = getChat()