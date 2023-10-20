//Import libraries
import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
//@ts-ignore
import qrcode from 'qrcode-terminal'

let wallet = null
let xmtp = null
//Fabri wallet
let WALLET_TO = "0x0E5d299236647563649526cfa25c39d6848101f5";
let conversation = null

//Initialize the wallet
async function initialize_the_wallet() {
  // You'll want to replace this with a wallet from your application
  wallet = Wallet.createRandom();
  console.log(`Wallet address: ${wallet.address}`);
}

// Create a client
async function create_a_client() {
  if (!wallet) {
    console.log("Wallet is not initialized");
    return
  }

  xmtp = await Client.create(wallet, { env: "production" });
  console.log("Client created", xmtp.address);
}

//Check if an address is on the network
async function check_if_an_address_is_on_the_network(WALLET_TO) {
  //Message this XMTP message bot to get an immediate automated reply:
  //gm.xmtp.eth (0x937C0d4a6294cdfa575de17382c7076b579DC176) env:production
  //
  if (xmtp) {
    const isOnDevNetwork = await xmtp.canMessage(WALLET_TO);
    console.log(`Can message: ${isOnDevNetwork}`);
    return isOnDevNetwork
  }
  return false
}

//Start a new conversation
async function start_a_new_conversation(WALLET_TO) {
  const canMessage = await check_if_an_address_is_on_the_network(WALLET_TO);
  if (!canMessage) {
    console.log("Cannot message this address. Exiting...");
    return;
  }

  if (xmtp) {
    conversation = await xmtp.conversations.newConversation(WALLET_TO);
    console.log(`Conversation created with ${conversation.peerAddress}`);
  }
}

//Send a message
async function send_a_message(message_content) {
  if (conversation) {
    const message = await conversation.send(message_content);
    console.log(`Message sent: "${message.content}"`);
    return message;
  }
}



// Stream all messages from all conversations
async function stream_all_messages() {
  printQrCode()
  if (xmtp) {
    for await (const message of await xmtp.conversations.streamAllMessages()) {
      console.log(`New message from ${message.senderAddress}: ${message.content}`);
    }
  }
}

function printQrCode() {
  //Use coinbase wallet to send a message
  qrcode.generate(`https://go.cb-w.com/messaging?address=${wallet?.address}`)
}

// Testing the functions
await initialize_the_wallet();
await create_a_client();
await start_a_new_conversation(WALLET_TO);
await send_a_message("Hi, FaceLink here - williamw.eth wants to reach out to you! \n\n Their Discord username is williamw. \n\n Their message for you is: \n\n Hi, it's William! We met at ETHGlobal NYC and sang karaoke together. Unfortunately, I didn't get your name or contact, but I had a great time and would to karaoke again sometime. I'll be back in NYC in 2 weeks so let it me know if you will be free then! My phone number 123-456-7890. Talk to you soon!");
await stream_all_messages()
