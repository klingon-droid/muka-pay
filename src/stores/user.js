import { atom } from 'nanostores'

export const username = atom('')

export function setUsername(name) {
    console.log('setting username:', name)
    username.set(name)
}


// // Convert string to field element
// function strToField(str) {
//     const bytes = Buffer.from(str);
//     let result = 0n;
//     for (let i = 0; i < bytes.length; i++) {
//         result = (result << 8n) + BigInt(bytes[i]);
//     }
//     return result;
// }

// export async function getUsernameHash() {
//     // Initialize Poseidon
//     const poseidon = await circomlibjs.buildPoseidon();

//     // Convert username to field element
//     const usernameField = strToField(username);

//     // Generate Poseidon hash
//     const usernameHash = poseidon([usernameField]);

//     // Return the hash as a string
//     return poseidon.F.toString(usernameHash);
// }






import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http()
  },
  connectors: [
    injected()
  ]
})