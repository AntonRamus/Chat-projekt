const chatNavn = document.getElementById("chatnavn")
const chatBesked = document.getElementById("chatbesked")
const opretChatKnap = document.getElementById("opretChat")

opretChatKnap.onclick = async () => {
    const navn = chatNavn.value
    const besked = chatBesked.value
    try {
        const data = await post('/opretChat', {navn: navn, besked: besked})
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