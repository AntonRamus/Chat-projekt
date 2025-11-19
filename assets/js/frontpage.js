const logout = document.getElementById('0')
const seChats = document.getElementById('seChats')

logout.onclick = async () => {
    //dårlig langsom løsning. fix hvis tid hihi
    window.location.href = '/logout'
}