"use strict";

import {htmlRegisterUser,htmlLoginUser,htmlHomeChat,htmlForAddNewContact,htmlHomeApplication,htmlInfoUser,htmlMessageChat,htmlMessageContact,htmlMyMessage,htmlPerfilAndOptionsContact} from "./html/htmlContainers.js";

const $ = selector=>document.querySelector(selector);
const $$ = selector=>document.querySelectorAll(selector);

const socket = io("https://tudominiodeelbackend.com",{
  autoConnect:false,
  withCredentials:true
});

function insertPageRegister (pushEndPointInHistory) {
  document.body.innerHTML = htmlRegisterUser;
  
  $(".container-register-user").onclick = clickContainerRegisterUser;
  
  if (pushEndPointInHistory) window.history.pushState(null,"","/register");
}

function insertPageHomeMain () {
  document.body.innerHTML = htmlHomeApplication;
  
  $(".register-or-login-container").onclick = ({target}) => {
    const BUTTON = target.id;
  
    if (BUTTON === "register") {
      insertPageRegister(true);
    }
    else if (BUTTON === "login") {
      insertPageLogin(true);
    }
  }
}

function insertPageLogin (pushEndPointInHistory) {
  document.body.innerHTML = htmlLoginUser
  
  $(".container-login-user").onclick = clickContainerLoginUser;
  
  if (pushEndPointInHistory) window.history.pushState(null,"","/login");
}

function redirectToPathName (dataUser) {
  const {pathname} = document.location;
  
  let userLogged = !dataUser.error;
  
  //SOLO SI EL USUARIO SE LE CIERRA LA SESION DESCONECTAMOS EL SOCKET
  if (!userLogged) socket.disconnect();
  
  if (!userLogged && pathname === "/register") insertPageRegister();
  else if (!userLogged && pathname === "/login") insertPageLogin();
  else if (!userLogged) {
    window.history.replaceState(null,"","/");
    insertPageHomeMain();
  }
  else if (pathname === "/add-contact") insertPageAddContact();
  else if (pathname === "/perfil") {
    const {idUser,username,urlPerfil} = dataUser;
    
    insertPagePerfilUser(idUser,username,urlPerfil);
  }
  else {
    if (pathname !== "/chat") window.history.replaceState(null,"","/chat");
    showHomeChatUser(dataUser);
  }
}

function changeOfPage () {
  window.onpopstate = () => {
    getDataUser()
  }
}

changeOfPage()

function getDataUser () {
  fetch("https://tudominiodeelbackend.com/user",{
    method:"GET",
    credentials:"include"
  }).then(res=>res.json()).then(data=>redirectToPathName(data))
}

getDataUser();

function changePhotoPerfil ({target}) {
  const $PARENTFILEINPUT = target.parentElement;
  
  const reader = new FileReader();
  
  let [img] = target.files;
  
  reader.readAsDataURL(img);
  
  reader.onload = () => {
    const $imgPerfil = new Image ();
    
    $imgPerfil.src = reader.result;
    
    $imgPerfil.classList.add("perfil-user");
    
    const $ICONCAMERA = $PARENTFILEINPUT.querySelector(".icon-camera");
    
    if ($ICONCAMERA) $ICONCAMERA.setAttribute("hidden","");
    
    $PARENTFILEINPUT.querySelector(".perfil-user")?.remove();
    
    $PARENTFILEINPUT.insertAdjacentElement("beforeend",$imgPerfil);
  }
}

function showOrHiddenPassword ($ICON) {
  let passwordHidden = $ICON.classList.contains("hidden-password");
  
  const $CONTAINERINPUTPASSWORD = $(".container-input.password");
  
  const $ICONTOSHOW = $CONTAINERINPUTPASSWORD.querySelector(`img.${passwordHidden ? "visible-password" : "hidden-password"}`)
  
  const $INPUTPASSWORD = $CONTAINERINPUTPASSWORD.querySelector("input");
  
  $ICON.setAttribute("hidden","");
  
  $ICONTOSHOW.removeAttribute("hidden");
  
  $ICONTOSHOW.classList.contains("visible-password") ? $INPUTPASSWORD.type = "text" : $INPUTPASSWORD.type = "password"
}

function clickContainerLoginUser ({target}) {
  const ID = target.id;
  
  if (target.classList.contains("eyes-password")) showOrHiddenPassword(target);
  else if (ID === "login-user") clickButtonLoginUser();
}

function clickButtonLoginUser () {
  const formData = getFormDataOfInputs();
  
  const $PASSWORDERRORMSG = $(".texts-field-container #message-password"),
  $USERNAMEERRORMSG = $(".texts-field-container #message-username");
  
  if (formData.get("username").trim() === "") {
    $USERNAMEERRORMSG.innerText = "Escribe Tu Nombre De Usuario";
    $USERNAMEERRORMSG.removeAttribute("hidden");
    return;
  } else $USERNAMEERRORMSG.setAttribute("hidden","");
  
  if (formData.get("password").trim() === "") {
    $PASSWORDERRORMSG.innerText = "Escribe Tu Contraseña";
    $PASSWORDERRORMSG.removeAttribute("hidden");
    return;
  } else $PASSWORDERRORMSG.setAttribute("hidden","");
  
  fetch("https://tudominiodeelbackend/login",{
    method:"POST",
    credentials:"include",
    body:formData
  }).then(res=>res.json()).then(res=>{
    if (res.error) {
      let $MESSAGEERROR;
      
      if (res.password) {
        $MESSAGEERROR = $(`.texts-field-container .message-error#message-password`);
        $(`.texts-field-container .message-error#message-username`).setAttribute("hidden","");
      } else {
        $MESSAGEERROR = $(`.texts-field-container .message-error#message-username`);
        $(`.texts-field-container .message-error#message-password`).setAttribute("hidden","");
      }
      
      $MESSAGEERROR.innerText = res.error
      
      $MESSAGEERROR.removeAttribute("hidden")
    }
    else {
      window.history.replaceState(null,"","/chat");
      showHomeChatUser(res)
    }
  }).catch();
}

function clickContainerRegisterUser ({target}) {
  const ID = target.id;
  
  if (ID === "search-photo-perfil") {
    if (!$("input#file-img")) target.insertAdjacentHTML("beforeend",`
      <input type="file" accept=".png,.jpg" id="file-img" hidden="">`);
  
    const $INPUTFILE = target.querySelector("input#file-img");
  
    $INPUTFILE.click();
    
    $INPUTFILE.onchange = changePhotoPerfil;
  }
  else if (target.classList.contains("eyes-password")) showOrHiddenPassword(target);
  else if (ID === "create-account") clickButtonCreateAccount();
}

function getFormDataOfInputs () {
  let formData = new FormData();
  
  $$(".container-input input").forEach($INPUT=>{
    const {name,value} = $INPUT;
    formData.append(name,value);
  })
  
  return formData;
}

function clickButtonCreateAccount () {
  let username = $(".container-register-user input.name"),
  password = $(".container-register-user input.password");
  
  const $USERNAMEERRORMSG = $(".texts-field-container .message-error.username"),
  $PASSWORDERRORMSG = $(".texts-field-container .message-error.password");
  
  if (username.value.trim().length < 5) {
    $USERNAMEERRORMSG.innerText = "El Nombre De Usuario Debe Contener Al Menos 5 Caracteres";
    
    $USERNAMEERRORMSG.removeAttribute("hidden");
    
    return;
  }
  else $USERNAMEERRORMSG.setAttribute("hidden","");
  
  if (password.value.trim().length < 5) {
    $PASSWORDERRORMSG.innerText = "La Contraseña Debe Contener Al Menos 8 Caracteres";
    
    $PASSWORDERRORMSG.removeAttribute("hidden");
    
    return;
  }
  else $PASSWORDERRORMSG.setAttribute("hidden","");
  
  const formData = getFormDataOfInputs();
  
  const $FILE = $("#search-photo-perfil #file-img");
  
  if ($FILE && $FILE.files[0]) formData.append("photoPerfil",$FILE.files[0])
  
  fetch("https://tudominiodeelbackend/register",{
    method:"POST",
    credentials:"include",
    body:formData
  }).then(res=>res.json()).then(res=>{
    if (res.error) {
      const $MESSAGEERROR =  $(".texts-field-container .message-error.username");
      
      $MESSAGEERROR.innerText = res.error
      
      $MESSAGEERROR.removeAttribute("hidden");
    }
    else {
      window.history.replaceState(null,"","/chat");
      showHomeChatUser(res)
    }
  }).catch(err=>console.log(err));
}

function clickContainerContact ({target}) {
  if (target.classList.contains("perfil")) {
    const {src} = target.firstElementChild,
    {username,idcontact} = target.parentElement.dataset;
    
    const HTML = htmlPerfilAndOptionsContact(username,src);
    
    $(".container-home-chat").insertAdjacentHTML("beforeend",HTML);
    
    const {left,top} = target.getBoundingClientRect(),
    positionContainerMain = $(".container-home-chat").getBoundingClientRect();
    
    let leftApply = left - positionContainerMain.x,
    topApply = top - positionContainerMain.y;
    
    const $CONTAINERTOMOVE = $(".container-img-buttons-contact"),
    $CONTAINERIMGINFOCONTACT = $CONTAINERTOMOVE.parentElement;
    
    $CONTAINERIMGINFOCONTACT.onclick = ({target}) => {
      if (target.classList.contains("container-img-info-contact")) {
        $CONTAINERTOMOVE.style.setProperty("left",leftApply + "px");
        $CONTAINERTOMOVE.style.setProperty("top",topApply + "px");
        $CONTAINERTOMOVE.style.setProperty("transform",`scale(0)`);
        
        $CONTAINERTOMOVE.style.setProperty("opacity",`0`);
        
        $CONTAINERIMGINFOCONTACT.style.setProperty("background-color","#00000000");
        
        $CONTAINERIMGINFOCONTACT.ontransitionend = () => $CONTAINERIMGINFOCONTACT.remove();
      }
      else if (target.id === "information") {
        document.body.innerHTML = htmlInfoUser(idcontact,username,src,"");
        
        $(".data-user-container #go-back").onclick = getDataUser;
      }
      else if (target.id === "messages") showMessagesChat(idcontact,username,src);
    }
    
    $CONTAINERTOMOVE.style.setProperty("left",leftApply + "px");
    $CONTAINERTOMOVE.style.setProperty("top",topApply + "px");
    
    setTimeout(()=>{
      $CONTAINERTOMOVE.classList.add("transition-active");
      
      $CONTAINERTOMOVE.style.setProperty("left",`calc(50% - 100px)`);
      $CONTAINERTOMOVE.style.setProperty("top",`calc(50% - 100px)`);
      $CONTAINERTOMOVE.style.setProperty("transform",`scale(1)`);
      $CONTAINERTOMOVE.style.setProperty("opacity",`1`);
      
      $CONTAINERIMGINFOCONTACT.style.setProperty("background-color","#0000007e");
    },0)
  }
  else if (target.classList.contains("container-contact")) {
    const {idcontact,username} = target.dataset;
    
    const {src} = target.querySelector(".perfil img");
    
    showMessagesChat(idcontact,username,src);
  }
}

function clickContainerChat ({target}) {
  const ID = target.id;
  
  if (ID === "back-home") {
    socket.emit("offline-user",{});
    getDataUser();
  }
  else if (ID === "send-message") {
    const {idcontact} = $(".container-chat-messages").dataset;
    
    const $input = $(".input-message");
    
    if (!$input.innerText.trim()) return;
    
    $(".container-messages").insertAdjacentHTML("beforeend",htmlMyMessage($input.innerText,getFormattingOfTime(new Date()),"send"));
    
    let msgWithoutLineBreaks = $input.innerText.split("\n").join(" ");
    
    socket.emit("send-message",{idcontact,msg:msgWithoutLineBreaks});
    
    $input.innerText = "";
  }
}

function getFormattingOfTime (date) {
  let hour = date.getHours(),
  minutes = date.getMinutes();
  
  let hourCorrect = hour,
  acronym = "am";
  
  if (hour > 12) {
    hourCorrect = hour - 12;
    acronym = "pm";
  } else if (hour === 12) acronym = "pm";
  else if (hour === 0) hour = 12;
  
  return `${hourCorrect}:${String(minutes).padStart(2,"0")} ${acronym}`;
}

function getLastTimeActiveContact (active) {
  let dateActive = new Date (active),
  currentTime = Date.now();
  
  let oneDayInMiliseconds = 60000 * 60 * 24;
  
  let differenceDay = Math.floor((currentTime - dateActive.getTime()) / oneDayInMiliseconds);
  
  let dayActive;
  
  if (differenceDay === 0) dayActive = "hoy";
  else if (differenceDay === 1) dayActive = "ayer"
  else return `ult. vez hace ${differenceDay} dias`;
  
  return `últ. vez ${dayActive} a las ${getFormattingOfTime(dateActive)}`
}

function showMessagesChat (idcontact,username,urlPerfil) {
  const showHtmlChat = (messages,contactActive) => {
    document.body.innerHTML = htmlMessageChat(urlPerfil,username,getLastTimeActiveContact(contactActive));
    
    const $CONTAINERCHAT = $(".container-chat-messages");
    
    $CONTAINERCHAT.setAttribute("data-idcontact",idcontact);
    
    $CONTAINERCHAT.onclick = clickContainerChat;
    
    const $CONTAINERMESSAGES = $(".container-messages");
    
    messages.forEach(({timestamp,msg,msgOf,statusMSG})=>{
      let dateMsg = new Date (timestamp);
      
      let htmlToInsert = msgOf === "contact" ? htmlMessageContact(msg,getFormattingOfTime(dateMsg)) : htmlMyMessage(msg,getFormattingOfTime(dateMsg),statusMSG);
      
      $CONTAINERMESSAGES.insertAdjacentHTML("beforeend",htmlToInsert);
    })
  }
  
  fetch(`https://tudominiodeelbackend/messages/${idcontact}`,{
    method:"GET",
    credentials:"include"
  }).then(res=>res.json()).then(res=>{
    if (res.error) return console.log("error",res.err);
    
    const {messages,active} = res;
    
    showHtmlChat(messages,active);
    
    socket.emit("change-status-message-received",{idcontact,statusMSG:"read"});
    
    socket.emit("online-user",{idcontact,counter:1});
  })
}

function insertHtmlContacts (contacts) {
  const htmlWithAllContacts = contacts.map(({username,urlPerfil,idUser,lastMessage,amountMessagesUnread})=>{
    let svgCheckMSG = "",
    timeLastMessage = "",
    message = "";
    
    if (lastMessage) {
      svgCheckMSG = lastMessage.msgOf === "own" ? `<svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="${lastMessage.statusMSG} check-msg">
    <path class="first-check" d="M4 12.9L7.14286 16.5L15 7.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="second-check" d="M20 7.5625L11.4283 16.5625L11 16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>` : "";
    
      let dateLastMSG = new Date (lastMessage.timestamp);
      
      let oneDayInMiliseconds = 60000 * 60 * 24;
      
      let diferenceInDays = Math.floor((Date.now() - lastMessage.timestamp) / oneDayInMiliseconds);
      
      if (diferenceInDays === 1) timeLastMessage = "Ayer";
      else if (diferenceInDays > 1) timeLastMessage = dateLastMSG.toLocaleDateString();
      else timeLastMessage = getFormattingOfTime(dateLastMSG);
      
      message = lastMessage.msg;
    }
    
    return `<div class="container-contact" data-idcontact="${idUser}" data-username="${username}">
  <div class="perfil">
    <img src="${urlPerfil}" alt="userPerfil">
  </div>
  <div class="user-name-and-last-message">
    <div class="user-name-and-date-last-message">
      <p class="user-name">${username}</p>
      <p class="time">${timeLastMessage}</p>
    </div>
    <div class="message-and-amount">
      <p class="last-message">
        ${svgCheckMSG}
        <span class="text">${message}</span>
      </p>
      <p class="amount-messages ${amountMessagesUnread > 0 ? "" :"hidden"}">${amountMessagesUnread}</p>
    </div>
   </div>
  </div>`
  })
  
  $(".container-contacts").innerHTML = htmlWithAllContacts.join("\n");
  
  $(".container-contacts").onclick = clickContainerContact;
}

function insertPageAddContact (pushEndPointInHistory) {
  document.body.innerHTML = htmlForAddNewContact;
  
  $(".container-for-add-contact button.save").onclick = addAContactToUser
  
  $(".container-for-add-contact button#back-to-home").onclick = () => {
    window.history.back();
  }
  
  if (pushEndPointInHistory) window.history.pushState(null,"","/add-contact");
}

function insertPagePerfilUser (idUser,username,urlPerfil,pushEndPointInHistory) {
  const HTMLINFO = htmlInfoUser(idUser,username,urlPerfil,"Perfil");
  
  document.body.innerHTML = HTMLINFO;
  
  $(".data-user-container #go-back").onclick = () => {
    window.history.back();
  }
  
  $(".data-user-container .container-perfil").onclick = changePhotoPerfilInInfoUser;
  
  if (pushEndPointInHistory) window.history.pushState(null,"","/perfil");
}

function showHomeChatUser (result) {
  const {idUser,username,urlPerfil,contacts} = result;
  
  document.body.innerHTML = htmlHomeChat;
  
  const $IMGPERFIL = $(".container-home-chat .container-perfil > img");
  
  $IMGPERFIL.src = urlPerfil;
  
  $(".container-home-chat button.add-contact").onclick = () => {
    insertPageAddContact(true)
  }
  
  if (contacts.length) insertHtmlContacts(contacts);
  
  $(".container-home-chat .container-perfil").onclick = (e) => {
    insertPagePerfilUser(idUser,username,urlPerfil,true)
  }
  
  connectToServerSocket();
}

function changeStatusCheckMyMSG ({msgSendStatus,idcontact}) {
  let $SVGS = [];
  
  const $SVGINHOME = $(`.container-home-chat .container-contact[data-idcontact="${idcontact}"] .check-msg`);
  
  if ($SVGINHOME && (($SVGINHOME.classList.contains("send") && msgSendStatus === "received") || ($SVGINHOME.classList.contains("received") && msgSendStatus === "read"))) $SVGS = [$SVGINHOME];
  else if (msgSendStatus === "received" && $(".container-chat-messages")) $SVGS = [...$$(`.container-chat-messages .check-msg.send`)];
  else if (msgSendStatus === "read" && $(".container-chat-messages")) $SVGS = [...$$(`.container-chat-messages .check-msg.send`),...$$(".container-chat-messages .check-msg.received")];
  
  $SVGS.forEach($SVG=>{
    let classToReplace;
    
    if ((msgSendStatus === "read" || msgSendStatus === "received") && $SVG.classList.contains("send")) classToReplace = "send";
    else if (msgSendStatus === "read") classToReplace = "received";
    
    $SVG.classList.replace(classToReplace,msgSendStatus);
  })
}

function connectToServerSocket () {
  if (!socket.connected) {
    socket.disconnect();
    
    socket.connect();
    
    socket.on("received-message",data=>{
      const {msg,timestamp,idcontact,amountMessagesUnread} = data;
    
      let dateMessage = new Date (timestamp);
    
      const $HOME = $(".container-home-chat"),$CHAT = $(".container-chat-messages");
    
      if ($HOME) {
        socket.emit("change-status-message-received",{idcontact,statusMSG:"received"});
        
        const $CONTACT = $(`.container-contacts .container-contact[data-idcontact="${idcontact}"]`);
        
        const $LASTMESSAGE = $CONTACT.querySelector(".last-message .text")
        
        const $TIMEMESSAGE = $CONTACT.querySelector(".time");
        
        const $AMOUNTMESSAGEUNREAD = $CONTACT.querySelector(".amount-messages");
        
        const $SVGSTATUSMSGOWN = $CONTACT.querySelector(".check-msg");
        
        $LASTMESSAGE.innerText = msg;
        
        $TIMEMESSAGE.innerText = getFormattingOfTime(dateMessage);
        
        $AMOUNTMESSAGEUNREAD.innerText = amountMessagesUnread;
        
        $AMOUNTMESSAGEUNREAD.classList.remove("hidden");
        
        $SVGSTATUSMSGOWN?.classList.add("hidden");
      }
      else if ($CHAT) {
        const $CONTAINERMESSAGES = $CHAT.querySelector(".container-messages");
        
        $CONTAINERMESSAGES.insertAdjacentHTML("beforeend",htmlMessageContact(msg,getFormattingOfTime(dateMessage)));
        
        socket.emit("change-status-message-received",{idcontact,statusMSG:"read"});
      }
      else socket.emit("change-status-message-received",{idcontact,statusMSG:"received"});
    })
    
    socket.on("change-status-of-messages-send",data => {
      changeStatusCheckMyMSG(data);
    })
    
    socket.on("contact-disconnected",({idcontact,timestamp})=>{
      const $CONTAINERCHATMSG = $(".container-chat-messages"),
      idContactOfChat = $CONTAINERCHATMSG?.dataset.idcontact;
      
      if ($CONTAINERCHATMSG && idContactOfChat === idcontact) {
        $CONTAINERCHATMSG.querySelector(".last-active-time").innerText = getLastTimeActiveContact(timestamp)
      }
    })
    
    socket.on("refresh-contact-list",({idUser,username,urlPerfil})=>{
      const $CONTAINERCONTACTS = $(".container-home-chat .container-contacts");
      
      if ($CONTAINERCONTACTS) {
        $CONTAINERCONTACTS.insertAdjacentHTML("beforeend",`<div class="container-contact" data-idcontact="${idUser}" data-username="${username}">
      <div class="perfil">
      <img src="${urlPerfil}" alt="userPerfil">
      </div>
      <div class="user-name-and-last-message">
      <div class="user-name-and-date-last-message">
          <p class="user-name">${username}</p>
          <p class="time"></p>
      </div>
      <div class="message-and-amount">
      <p class="last-message">
        <span class="text"></span>
      </p>
      <p class="amount-messages hidden"></p>
      </div>
      </div>
      </div>`)
      
      !$CONTAINERCONTACTS.onclick ? $CONTAINERCONTACTS.onclick = clickContainerContact : "";
      }
    })
    
    socket.on("online-contact",data=>{
      const $CONTAINERMESSAGES = $(".container-chat-messages");
      
      let {idcontact} = $CONTAINERMESSAGES?.dataset ?? {}
      
      if ($CONTAINERMESSAGES && idcontact === data.idcontact && data.counter <= 2) {
        $(".container-chat-messages .last-active-time").innerText = "en linea";
        
        if (data.counter < 2) socket.emit("online-user",{counter:data.counter + 1,idcontact})
      }
    })
  }
}

function changePhotoPerfilInInfoUser ({currentTarget}) {
  if (!currentTarget.querySelector("input#file-img")) currentTarget.insertAdjacentHTML("beforeend",`<input type="file" accept=".png,.jpg" id="file-img" hidden="">`);
  
  const $INPUTFILE = currentTarget.querySelector("input#file-img");
  
  currentTarget.onclick = null;
  
  $INPUTFILE.click();
  
  $INPUTFILE.onchange = ({target}) => {
    changePhotoPerfil({target});
    
    let [img] = target.files,
    form = new FormData();
    
    form.append("photoPerfil",img);
    
    fetch("https://tudominiodeelbackend/change-perfil",{
      method:"PATCH",
      credentials:"include",
      body:form
    }).then(res=>res.json()).then(res=>{
      if (res.success) console.log("The profile picture was successfully changed.");
      else console.log(res.error)
    })
    
    currentTarget.onclick = changePhotoPerfilInInfoUser;
  }
  
  $INPUTFILE.oncancel = ()=>currentTarget.onclick = changePhotoPerfilInInfoUser;
}

function addAContactToUser () {
  let IDCONTACT = $("input#id-contact").value;
  
  fetch(`https://tudominiodeelbackend/add-contact?idcontact=${IDCONTACT}`,{
    method:"POST",
    credentials:"include"
  }).then(res=>res.json()).then(data=>{
    if (data.success) {
      window.history.pushState(null,"","/chat")
      getDataUser();
      socket.emit("added-contact",IDCONTACT);
    }
    else console.log("sucedio un error",data)
  })
}