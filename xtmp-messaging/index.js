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
async function check_if_an_address_is_on_the_network() {
  //Message this XMTP message bot to get an immediate automated reply:
  //gm.xmtp.eth (0x937C0d4a6294cdfa575de17382c7076b579DC176) env:production
  //
  WALLET_TO = "0x0E5d299236647563649526cfa25c39d6848101f5";
  if (xmtp) {
    const isOnDevNetwork = await xmtp.canMessage(WALLET_TO);
    console.log(`Can message: ${isOnDevNetwork}`);
    return isOnDevNetwork
  }
  return false
}

//Start a new conversation
async function start_a_new_conversation() {
  const canMessage = await check_if_an_address_is_on_the_network();
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
async function send_a_message() {
  if (conversation) {
    const message = await conversation.send("gm from the quickstart.");
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

// Run the functions
await initialize_the_wallet();
await create_a_client();
await start_a_new_conversation();
await send_a_message();
await stream_all_messages()
