import { atom } from 'nanostores'

export const username = atom('')
export const refreshBalance = atom(0)

export function setUsername(name) {
    console.log('setting username:', name)
    username.set(name)
}

import * as circomlibjs from 'circomlibjs'
import * as snarkjs from 'snarkjs'

// Convert string to field element
function strToField(str) {
    const bytes = Buffer.from(str);
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
        result = (result << 8n) + BigInt(bytes[i]);
    }
    return result;
}

export async function getUsernameHash(_username) {
    // Initialize Poseidon
    const poseidon = await circomlibjs.buildPoseidon();

    // Convert username to field element
    const usernameField = strToField(_username);

    // Generate Poseidon hash
    const usernameHash = poseidon([usernameField]);

    // Return the hash as a string
    return poseidon.F.toString(usernameHash);
}

// Generate proof with actual inputs
export async function generateProof(_username, _password, _nonce = Date.now()) {
    // Initialize Poseidon
    const poseidon = await circomlibjs.buildPoseidon();

    // Convert inputs to field elements
    const usernameField = strToField(_username);
    const passwordField = strToField(_password);

    // Generate Poseidon hashes
    const usernameHash = poseidon([usernameField]);
    const credentialHash = poseidon([usernameField, passwordField]);

    // Create final hash with credential hash and nonce
    const finalHash = poseidon([credentialHash, BigInt(_nonce)]);

    // Create input for the circuit
    // Create input for the circuit
    const input = {
        username: usernameField.toString(),
        password: passwordField.toString(),
        username_hash: poseidon.F.toString(usernameHash),
        credential_hash: poseidon.F.toString(credentialHash),
        nonce: _nonce.toString(),
        result_hash: poseidon.F.toString(finalHash)
    };
    
    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "./circuit.wasm",
        "./circuit_final.zkey"
    );

    return { 
        proof, 
        publicSignals,
        input,
    };

}





import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const walletAccount = atom(null)

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'a55bcf3f2dffbf18635ad54280b33547',
      showQrModal: true,
      metadata: {
        name: 'snappay',
        description: 'Snap Pay',
        url: 'https://snappay.ing',
        icons: ['https://snappay.ing/logo.png']
      },
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': 99999
        },
        containerElements: {
          w3mModal: document.body,
          w3mOverlay: document.body
        }
      }
    })
  ],
  transports: {
    [base.id]: http()
  }
})


export const VAULT_CONTRACT_ADDRESS = "0xacC07577A4324cf6bC12A049B33Cf906c5567099";
export const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";


export const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
]

export const VAULT_ABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "usernameHash",
                "type": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "deposit",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
]


