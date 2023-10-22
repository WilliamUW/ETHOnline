# ETHOnline
## Project Description

This project allows users to send crypto and messages to anyone as long as they have a picture of their face. We use biometric data in combination with AI to create a unique hash for every face, and link that face to a wallet address. From there, through a discord bot, anyone can send messages or crypto to this individual without needing to know their wallet address.


## How it's Made

This project's interface is a discord bot to handle registration, messaging, and sending tokens.

At the core, we used Computer Vision with OpenCV and the Dlib C++ Library to implement AI-based facial biometric encoding and recognition.

We also leveraged XTMP API to enable wallet-to-wallet messages for contacting connections

On the backend is a smart contract to handle to mapping of face hashes to wallet addresses.

We used foundry to help develop, test, and deploy the contracts to several EVM chains.

We additionally used UMA for possible face hash disputes.

Utilized discord.py to integrate the user flow into Discord to reduce user friction and allow access on mobile, web, and desktop natively!
