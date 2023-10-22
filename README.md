# ETHOnline
## Project Description

With this project, users can send crypto 💸 and messages 💌 to anyone, as long as they have a photo 📸 of their face. By merging biometric data with AI, we create a unique hash for each face and connect that face to a wallet address. And the magic happens through a Discord bot – so you can send messages or crypto without needing the receiver's wallet address.

## How it's Made
FaceLink is deployed and fully functional on Scroll, Mantle, and Polygon to act as an onchain mapping of biometric facial hash encoding to wallet addresses that be remapped as needed depending on if one's facial hash changes or one's wallet address changes.

**Interface:** Our main interface is a Discord bot to handle registration, messaging, and sending crypto.

**Tech Core:** We employ Computer Vision, OpenCV, and the Dlib C++ Library for AI-driven facial recognition. Web3.Storage API to store the selfies that users upload, ensuring that in case the biometric encoding information is lost, we are still able to cross reference the images as a failsafe and create new encodings.

**Messaging:** The XTMP API enables wallet-to-wallet messages for easy communication.

**Backend:** A smart contract efficiently maps face hashes to wallet addresses. Mask's Universal Profile API to fetch a user's Ethereum address with any one of the following: an ENS domain, a Lens handle, a Farcaster username (ends with .farcaster), a .bit domain, or a Next.ID address. We are leveraging Tableland's decentralized cloud database to store and manage our Person objects, associating individuals' wallet addresses with their facial hash! Our Studio team name is williamwang, and our dev address is 0x0E5d299236647563649526cfa25c39d6848101f5.

**Development:** Using Foundry, we develop, test, and deploy the contracts to various EVM chains. 

**Dispute Handling:** UMA is there for any potential face hash disputes.

**Integration:** Thanks to discord.py, users enjoy a smooth journey on Discord, accessible via mobile, web, and desktop.



