export const htmlForAddNewContact = `<div class="container-for-add-contact">
    <div class="header">
      <button id="back-to-home">
        <img src="./iconsSvg/back-svgrepo-com.svg" alt="back">
      </button>
      <p>Agregar Contacto</p>
    </div>
    <div class="container-input">
      <img src="./iconsSvg/user-svgrepo-com.svg" alt="contact">
      <input type="text" placeholder=" " id="id-contact">
      <p>ID Contacto</p>
    </div>
    <button class="save">Guardar</button>
  </div>`
  
export const htmlHomeChat = `<div class="container-home-chat">
    <div class="header">
      <div class="container-name-aplication-and-logo">
        <img src="./imgs/mensaje 1.png" alt="icon message" class="logo-application">
        <h3>MeSsages</h3>
      </div>
      <div class="container-perfil" id="info-user">
        <img alt="perfil">
      </div>
    </div>
    <div class="container-contacts">
    </div>
    <button class="add-contact">
      <img src="./iconsSvg/add-contact-svgrepo-com.svg" alt="add-contact">
    </button>
  </div>`
  
export const htmlRegisterUser = `<div class="container-register-user">
  <img src="./imgs/mensaje 1.png" alt="icon message" class="icon-application">
  <div class="photo-perfil-container" id="search-photo-perfil">
    <img src="./iconsSvg/camera-svgrepo-com.svg" alt="camera" class="icon-camera">
  </div>
  <section class="register-account">
    <div class="texts-create-account">
      <h3>Crea una Cuenta</h3>
      <p>Registrate para Continuar</p>
    </div>
    <div class="texts-field-container">
      <p class="name">NOMBRE</p>
      <div class="container-input">
        <input type="text" class="name" name="username">
      </div>
      <p class="message-error username" hidden=""></p>
      <p class="name">COTRASEÑA</p>
      <div class="container-input password">
        <input type="password" class="password" name="password">
        <img src="./iconsSvg/eye-invisible-svgrepo-com.svg" alt="eye-invisible" class="hidden-password eyes-password">
        <img src="./iconsSvg/eye-svgrepo-com.svg" alt="eye-visible" class="visible-password eyes-password" hidden="">
      </div>
      <p class="message-error password" hidden=""></p>
      <button class="create-account" id="create-account">Comenzar</button>
    </div>
  </section>
  </div>`;
  
export const htmlLoginUser = `<div class="container-login-user">
  <img src="./imgs/mensaje 1.png" alt="icon message" class="icon-application">
  <section class="login-account">
    <div class="texts-login-account">
      <h3>Iniciar Sesión en la Cuenta</h3>
      <p>Regístrate Para Continuar</p>
    </div>
    <div class="texts-field-container">
      <p class="name">NOMBRE</p>
      <div class="container-input">
        <input type="text" name="username">
      </div>
      <p class="message-error" id="message-username" hidden=""></p>
      <p class="name">CONTRASEÑA</p>
      <div class="container-input password">
        <input type="password" name="password">
        <img src="./iconsSvg/eye-invisible-svgrepo-com.svg" alt="eye-invisible" class="hidden-password eyes-password">
        <img src="./iconsSvg/eye-svgrepo-com.svg" alt="eye-visible" class="visible-password eyes-password" hidden="">
      </div>
      <p class="message-error" id="message-password" hidden=""></p>
      <button class="login-user" id="login-user">Empezar</button>
    </div>
  </section>
  </div>`;
  
export const htmlHomeApplication = `<div class="home-aplication">
    <img src="./imgs/mensaje 1.png" alt="icon message" class="icon-application">
    <div class="register-or-login-container">
      <button class="register" id="register">Registrate</button>
      <button class="login" id="login">Iniciar Sesion</button>
    </div>
  </div>`
  
export function htmlInfoUser (id,username,urlPerfil,option) {
  return `<section class="data-user-container">
    <article class="header">
      <button id="go-back">
        <img src="./iconsSvg/back-svgrepo-com.svg" alt="back">
      </button>
      <p>${option}</p>
    </article>
    <article class="container-perfil">
      <img src="${urlPerfil}" alt="perfil" class="perfil-user">
    </article>
    <article class="container-datas">
      <div class="container-data">
        <img src="./iconsSvg/user-svgrepo-com.svg" alt="user">
        <div class="text-info">
          <p class="name-data">Username</p>
          <p class="value-data" id="username">${username}</p>
        </div>
      </div>
      <div class="container-data">
        <img src="./iconsSvg/id-card-svgrepo-com.svg" alt="user-id">
        <div class="text-info">
          <p class="name-data">Id</p>
          <p class="value-data" id="id-user">${id}</p>
        </div>
      </div>
      ${option === "Perfil" ? `<div class="container-logout">
        <img src="./iconsSvg/logout-line-svgrepo-com.svg" alt="logout" />
        <p>Cerrar Sesión</p>
      </div>` : ""}
    </article>
  </section>`
}

export const htmlMessageChat = (urlPerfil,username,lastActiveTime) => `<section class="container-chat-messages">
    <article class="header">
      <img src="./iconsSvg/back-svgrepo-com.svg" alt="back" id="back-home">
      <div class="perfil">
        <img src="${urlPerfil}" alt="userPerfil">
      </div>
      <div class="texts">
        <p class="username">${username}</p>
        <p class="last-active-time">${lastActiveTime}</p>
      </div>
    </article>
    <article class="container-center">
      <article class="container-messages">
      </article>
      <article class="container-send-message">
        <div contenteditable="true" class="input-message"></div>
        <button id="send-message">
          <img src="./iconsSvg/send-alt-1-svgrepo-com.svg" alt="send">
        </button>
      </article>
    </article>
  </section>`
  
export const htmlMessageContact = (messageContact,time) => `<div class="contact-message">${messageContact}<div class="time-and-check">
    <p>${time}</p>
    </div>
  </div>`
  
export const htmlMyMessage = (myMessage,time,statusMSG) => `<div class="my-message">${myMessage}<div class="time-and-check">
      <p>${time}</p>
      <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="${statusMSG} check-msg">
        <path class="first-check" d="M4 12.9L7.14286 16.5L15 7.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="second-check" d="M20 7.5625L11.4283 16.5625L11 16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>`
  
export const htmlPerfilAndOptionsContact = (username,urlPerfil) => `<div class="container-img-info-contact">
      <div class="container-img-buttons-contact">
        <p class="username-contact">${username}</p>
        <img src="${urlPerfil}" class="img-contact" alt="contact-perfil">
        <div class="buttons">
          <button id="messages">
            <img src="./imgs/chat.png" alt="icon chat">
          </button>
          <button id="information">
            <img src="./imgs/info.png" alt="info contact">
          </button>
        </div>
      </div>
    </div>`