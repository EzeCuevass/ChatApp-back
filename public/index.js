const socket = io();
let mensajes = document.getElementById("box-messages")
let chatsdata = document.getElementById("chats-data")
let grouprow = document.getElementsByClassName("group-row")
 // function to scroll to the bottom of the chat
 function scrollToBottom() {
    const box = document.getElementById('box-messages');
    if (box) {
        box.scrollTop = box.scrollHeight;
    }
}
// function to scroll to the bottom of the group chat
 function scrollToBottomGroup() {
    const box = document.getElementById('box-messages-group');
    if (box) {
        box.scrollTop = box.scrollHeight;
    }
}

function scrollToBottomAllChats() {
    const boxes = document.getElementsByClassName('box-messages');
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].scrollTop = boxes[i].scrollHeight;
    }
}

socket.emit('get')
Array.from(grouprow).forEach((group) =>{
    let id = group.getAttribute("data-id");
    
    socket.emit('getgroup', id);
});

socket.on('mensajesFront', (messages)=>{
    for ( const mensaje of messages){
        const mensajeindividual = mensaje.message
        const usuariomensaje = mensaje.user ? mensaje.user.username : undefined
        if (mensajes == null){
            return
        } else {
        if (usuariomensaje != undefined){
            mensajes.innerHTML += `<p>${usuariomensaje} says:</p>
                                    <p>${mensajeindividual}</p>`
        } else {
            mensajes.innerHTML += `<p>Anonymous says:</p>
                                    <p>${mensajeindividual}</p>`
        }
    }
    }
    scrollToBottom()
})
if (document.getElementById("formgod")) { 
    document.getElementById("formgod").addEventListener(
        "submit", async (event) => {
            event.preventDefault()
            await socket.emit('sendmessage', message.value,id.value)
            message.value = ""
        }
    )
}
if (document.getElementById("formgroup")) {
    let mensajesgrupo = document.getElementById("box-messages-group")
        socket.on('groupFront', async (groupdata) => {
             if (!groupdata){
                return;
            }
            const currentGroupId = document.getElementById("groupid").value;
            if (groupdata._id !== currentGroupId) {
                 Array.from(grouprow).forEach((group) => {
                    if (group.getAttribute("data-id") == groupdata._id) {
                        group.textContent = groupdata.name;
                    }
                    });
                return;
            }
            Array.from(grouprow).forEach((group) =>{
                if (group.getAttribute("data-id") == groupdata._id){
                    group.innerHTML = `<a href="/group/:id?id=${groupdata._id}"> <h3 class="group-row">${groupdata.name}</h3></a> `
                }
            })
            
            mensajesgrupo.innerHTML = "";
            for ( const mensaje of groupdata.messages){
                const mensajeindividual = mensaje.message
                const usuariomensaje = mensaje.user.username
                if (usuariomensaje != undefined){
                    mensajesgrupo.innerHTML += `<p>${usuariomensaje} says:</p>
                                            <p>${mensajeindividual}</p>`
                }
            }
            scrollToBottomAllChats();
        })
    document.getElementById("formgroup").addEventListener(
        "submit", async (event) => {
            event.preventDefault()
            await socket.emit('sendmessagetogroup', groupid.value,message.value,userid.value)
            message.value = ""
        }
    )
    socket.on("newmessagefrontgroup", (newmessage) => {
        const currentGroupId = document.getElementById("groupid").value;
        const groupid = newmessage.groupid
        if (groupid !== currentGroupId) {
            return;
        } else {
            const mensaje = newmessage.mensaje.message
            const user = newmessage.mensaje.user.username 
            mensajesgrupo.innerHTML+= `  <p>${user} says:</p>
                                    <p>${mensaje}</p>`
            scrollToBottomAllChats();
        }
    })
} 

socket.on("newmessagefront", (newmessage) => {
    const mensaje = newmessage.message
    console.log(newmessage);
    const user = newmessage.user ? newmessage.user.username : "Anonymous"
    mensajes.innerHTML+= `  <p>${user} says:</p>
                            <p>${mensaje}</p>`
    scrollToBottomAllChats();
})

// modals for login, register and create group
let dialogLog = document.getElementById("dialogLog")
let login = document.getElementById("login")
if (dialogLog != null){
    dialogLog.addEventListener("click", ()=>{
    login.showModal()
    })   
}
let dialogRegister = document.getElementById("dialogRegister")
let register = document.getElementById("register")
if (dialogRegister != null){
    dialogRegister.addEventListener("click", ()=>{
    register.showModal()
})
}
let closeLog = document.getElementById("closeLog")
// close login and register modals
if (closeLog != null){
    closeLog.addEventListener("click", ()=> {
    login.close()
})
}
let closeRegister = document.getElementById("closeRegister")
if( closeRegister != null){
    closeRegister.addEventListener("click", () => {
    register.close()
})
}
let dialogCreateGroup = document.getElementById("dialogCreateGroup")

let createGroup = document.getElementById("createGroup")
if (dialogCreateGroup != null){
    dialogCreateGroup.addEventListener("click", () => {
        createGroup.showModal()
    })
}
let closeCreateGroup = document.getElementById("closeCreateGroup")
if (closeCreateGroup != null){  
    closeCreateGroup.addEventListener("click", () => {
        createGroup.close()
    })
}