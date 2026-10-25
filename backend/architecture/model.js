import {USERS} from "../models/user.js";
import {CONTACTS} from "../models/contact.js";
import {MESSAGES} from "../models/message.js";

export class Model {
  static async getDataUserByUsername (username) {
    const DATA = await USERS.findOne({username});
    return DATA;
  }
  static async existUser ({username,idUser}) {
    let exist = await USERS.exists(username ? {username} : {idUser})
    
    return exist ? true : false;
  }
  static async getDataUserById (idUser) {
    const DATA = await USERS.findOne({idUser});
    return DATA;
  }
  static async getIdContactsUser (idUser) {
    let CONTACTSR = await CONTACTS.findOne({idUser});
    return CONTACTSR;
  }
  static async createRegistersUserInDBS (data) {
    const {idUser} = data;
    await MESSAGES.create({idUser});
    await USERS.create(data);
    await CONTACTS.create({idUser});
    return;
  }
  static async getAllDataUser (idUser) {
    const {username,urlPerfil} = await USERS.findOne({idUser});
  
    let {contactsID} = await CONTACTS.findOne({idUser});
  
    const {messagesContacts} = await MESSAGES.findOne({idUser});
  
    let dataContacts = contactsID.map(async (idContact) => {
      const {username,urlPerfil} = await USERS.findOne({idUser:idContact});
    
      let myMessagesWithThisContact = messagesContacts[idContact];
    
      let lastMessage = myMessagesWithThisContact.at(-1);
      
      let amountMessagesUnread = myMessagesWithThisContact.reduce((counter,message)=>{
        const {msgOf,openMSG} = message;
        
        if (msgOf === "contact" && !openMSG) return counter + 1;
        
        return counter;
      },0);
    
      return {
        idUser:idContact,
        username,
        urlPerfil,
        lastMessage,
        amountMessagesUnread
      }
    });
  
    let dataContactsResolve = await Promise.all(dataContacts);
  
    return {
      idUser,
      username,
      urlPerfil,
      contacts:dataContactsResolve
    }
  }
  static async addContactInDB ({idUser,idcontact}) {
    //AL AGREGAR CONTACTOS AMBOS USUARIOS DEBEN DE AGREGARSE EN SUS LISTA DE CONTACTOS
    await CONTACTS.updateOne({idUser},{
      $addToSet:{contactsID:idcontact}
    })
    
    await CONTACTS.updateOne({idUser:idcontact},{
      $addToSet:{contactsID:idUser}
    })
    
    let messagesUser = await MESSAGES.findOne({idUser});
    
    //creamos la lista donde alojaremos los mensajes de ambos contactos si aun no esta creada
    
    if (!(idcontact in messagesUser.messagesContacts)) {
      await MESSAGES.findOneAndUpdate({idUser},{
        $set:{[`messagesContacts.${idcontact}`]:[]}
      })
    
      await MESSAGES.findOneAndUpdate({idUser:idcontact},{
        $set:{[`messagesContacts.${idUser}`]:[]}
      })
    }
    
    return;
  }
  static async updatePerfilOfUser (idUser,url,filename) {
    await USERS.updateOne({idUser},{
      $set:{urlPerfil:url,filenamePerfil:filename}
    });
    return;
  }
  static async getMessagesWithContact (idUser,idContact) {
    const {messagesContacts} = await MESSAGES.findOne({idUser});
    
    return messagesContacts[idContact];
  }
  static async updateIdConnectionSocketOfUser (idUser,idConnection) {
    await USERS.updateOne(
    {idUser},
    {$set:{idConnection:idConnection}});
    return;
  }
  static async updateLastConnectionUser (idUser,timestamp) {
    await USERS.updateOne(
    {idUser},
    {$set:{active:timestamp}});
    return;
  }
  static async pushMessageForContactAndUser (idUser,idcontact,msg,timestamp) {
    await MESSAGES.findOneAndUpdate({idUser:idcontact},{
    $push:{[`messagesContacts.${idUser}`]:{msg,timestamp,msgOf:"contact",openMSG:false}}});
    
    await MESSAGES.findOneAndUpdate({idUser},{
        $push:{[`messagesContacts.${idcontact}`]:{msg,timestamp,msgOf:"own",statusMSG:"send"}}})
    return;
  }
  static async changeStatusMessageToReadInBothUsers (idUser,idcontact) {
    await MESSAGES.findOneAndUpdate({idUser},{
        $set:{[`messagesContacts.${idcontact}.$[elem].openMSG`]:true}
      },{
        arrayFilters:[{"elem.openMSG":false}]
      });
      
    await MESSAGES.findOneAndUpdate({idUser:idcontact},{
        $set:{[`messagesContacts.${idUser}.$[elem].statusMSG`]:"read"}
        },{
        arrayFilters:[{"elem.msgOf":"own"}]
      })
    
    return;
  }
  static async changeStatusMessageToReceivedForContact (idcontact,idUser) {
    await MESSAGES.findOneAndUpdate({idUser:idcontact},{
      $set:{[`messagesContacts.${idUser}.$[elem].statusMSG`]:"received"}
        },{
      arrayFilters:[{"elem.statusMSG":"send"}]
    })
    return;
  }
}