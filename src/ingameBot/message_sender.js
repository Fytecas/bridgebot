const { MessageType } = require("discord.js");
const { sendMessageInChat } = require("./main");
const SETTINGS = require("../settings");
const client = require("../client");
var cron = require("node-cron");

let messagesToSend = []
module.exports = {
    send_message: (message) => {
        if (message.author.tag !== client.user.tag && message.channelId === SETTINGS.channels.bridgeId && ! message.author.bot) {
            // Renamed to currentMessage for clarity
            let currentMessage = "";
            if(message.type === MessageType.Reply) {
              const repliedMember = message.mentions.members.find(member => member.id = message.mentions.repliedUser.id)

              if(message.member.nickname && repliedMember.nickname) {
                    currentMessage = `${message.member.nickname} > ${repliedMember.nickname}: ${message.content}`
                 } else if (message.member.nickname) {  
                    currentMessage = `${message.member.nickname} > ${message.mentions.repliedUser.displayName}: ${message.content}`
                } else if(!repliedMember) {
                    currentMessage = `${message.member.displayName} > ${message.mentions.repliedUser.displayName}: ${message.content}`
                } else if(repliedMember.nickname) {
                    currentMessage = `${message.member.displayName} > ${repliedMember.nickname}: ${message.content}`
                } else {
                    currentMessage = `${message.member.displayName} > ${message.mentions.repliedUser.displayName}: ${message.content}`
                 }
            } else {
              if(message.member.nickname) {
                    currentMessage = `${message.member.nickname}: ${message.content}`
                 } else {
                    currentMessage = `${message.member.displayName}: ${message.content}`
                 }
            }
            
            if(currentMessage.length < 128) {
                messagesToSend.push(currentMessage)
            } else {
                // Divide the message in less than 128 characters parts without cutting a word
                let messageParts = currentMessage.split(/(?<=\s)/);
                for(let i = 0; i < messageParts.length; i++) {
                    if(currentMessage.length + messageParts[i].length < 128) {
                        currentMessage += messageParts[i];
                    } else {
                        messagesToSend.push(currentMessage);
                        currentMessage = messageParts[i];
                    }
                }
            }
          } 
    }, 
    bridgeInit
}

function bridgeInit() {
    cron.schedule(`*/${SETTINGS.bridgeCooldown} * * * * *`, () => {
      if(messagesToSend.length > 0) {
        sendMessageInChat(messagesToSend[0])
        messagesToSend.shift()
      }
    });
}

