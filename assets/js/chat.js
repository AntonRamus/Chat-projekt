let url = document.URL.split('/')
const id = url[url.length - 1]

async function getChat(id) {
    const response = await fetch('/api/chats/' + id)
    return response.json()
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

async function initChat() {
    const chat = await getChat(id)
    const beskeder = chat.beskeder
    for (let besked of beskeder) {
        const chatDiv = document.getElementById('li' + besked.id)
        const tekst = document.createElement('p')
        chatDiv.prepend(tekst)

        let toShow = `${besked.ejer}: ${besked.besked} (${besked.oprettelsesdato})`

        tekst.innerHTML = toShow


        const ret = document.getElementById('ret' + besked.id)
        const slet = document.getElementById('slet' + besked.id)

        if (ret != null) {
            ret.onclick = async () => {
                let apiCall = `/api/chats/${id}/${besked.id}`
                let message = prompt('Ret besked', besked.besked)

                if (message == null || message == "") {
                    //something here maybe?
                } else {
                    try {
                        const data = await post(apiCall, { besked: message })
                        if (data.ok == true) {
                            window.location.href = `/chats/${id}`
                        }
                    } catch (error) {
                        console.log(`Der skete en fejl: ${error}`)
                    }
                }
            }
        }

        if (slet != null) {
            slet.onclick = async () => {
                let apiCall = `/api/chats/${id}/${besked.id}`
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
                window.location.href = `/chats/${id}`
            }
        }

    }
}

initChat()

const opretBesked = document.getElementById('opretBesked')

opretBesked.onclick = async () => {
    let apiCall = `/api/chats/${id}/*`
    let message = document.getElementById('nyBesked').value

    if (message == null || message == "") {
        //something here maybe?
    } else {
        try {
            const data = await post(apiCall, { besked: message })
            if (data.ok == true) {
                window.location.href = `/chats/${id}`
            }
        } catch (error) {
            console.log(`Der skete en fejl: ${error}`)
        }
    }

}