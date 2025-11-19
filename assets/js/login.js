const username = document.getElementById('0')
const password = document.getElementById('1')
const login = document.getElementById('2')
const fejl = document.getElementById('3')

login.onclick = async () => {
    console.log('clicked on login')
    try {
        const data = await post("/login", { username: username.value, password: password.value });
        if (data.ok == true) {
            window.location.href = "/"
        }
    } catch (e) {
        password.value = "";
        fejl.innerHTML = "Forkert password eller intet navn!";
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