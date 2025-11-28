export class chat {
    constructor(id, navn, ejer) {
        this.id = id
        this.navn = navn
        this.ejer = ejer
        this.oprettelsesdato = new Date().toLocaleDateString()
        this.beskeder = []
    }
    addMessage (message) {
        this.beskeder.push(message)
    }
}

export class message {
    constructor(id, besked, ejer, chattilhørsforhold) {
        this.id = id
        this.besked = besked
        this.ejer = ejer
        this.oprettelsesdato = new Date().toLocaleDateString()
        this.chattilhørsforhold = chattilhørsforhold
    }
}