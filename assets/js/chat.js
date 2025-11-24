let url = document.URL.split('/')
const id = url[url.length - 1]

async function getChat(id) {
    const response = await fetch('/api/chats/' + id)
    return response.json()
}

async function initChat() {
    const chat = await getChat(id)
    const beskeder = chat.beskeder
    for (let besked of beskeder) {
        const chatDiv = document.getElementById(besked.id)
        const tekst = document.createElement('p')
        chatDiv.prepend(tekst)

        let toShow = besked.ejer + ': ' + besked.besked + ' (' + besked.oprettelsesdato + ')'

        tekst.innerHTML = toShow


        const ret = document.getElementById('ret' + besked.id)
        const slet = document.getElementById('slet' + besked.id)

        slet.onclick = async () => {
            let apiCall = '/api/chats/' + id + '/' + besked.id
            const response = await fetch(apiCall, {
                method: 'DELETE'
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // or response.text() depending on your API
            })
                .then(data => {
                    console.log('Delete successful:', data);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    }
}

initChat()