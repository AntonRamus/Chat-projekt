const createUser = document.getElementById('opretUser')
const tilbage = document.getElementById('tilbage')
const logud = document.getElementById('logud')

createUser.onclick = async () => {
        console.log("trying to create user")
        const newUser = {
            brugernavn: document.getElementById('brugernavn').value.trim(),
            password: document.getElementById('password').value,
            oprettelsesdato: new Date().toISOString(),
            brugerniveau: document.getElementById('brugerniveau').value.trim()
        }

        const response = await fetch('/opretUser', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newUser)
        });

        if(response.ok){
                console.log("New User cretated")
                window.location.href = "/"
        }else
                throw new error(response.status)

}

logud.onclick = async () => {
        window.location.href ="/logout"
}

tilbage.onclick = async () => {
        window.location.href = "/"
}