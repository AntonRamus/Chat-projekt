const chatNavn = document.getElementById("chatnavn")

async function retChat(chatID) {
    const navn = chatNavn.value
    try {
        const data = await post(`/chats/ret/${chatID}`, { navn: navn })
        if (data.ok == true) {
            window.location.href = "/chats"
        }
    } catch (error) {
        console.log(error)
    }
}

async function post(url, objekt) {
    const respons = await fetch(url, {
        method: "POST",
        body: JSON.stringify(objekt),
        headers: { 'Content-Type': 'application/json' }
    })
    if (respons.status !== 201)
        throw new Error(respons.status)
    return await respons.json()
}