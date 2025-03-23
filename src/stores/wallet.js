import { atom } from 'nanostores'
import { getAccount, getConnectors, connect, disconnect, switchChain, reconnect } from '@wagmi/core'
import { baseSepolia } from 'wagmi/chains'
import { wagmiConfig } from './user'

// State atoms
export const isConnected = atom(false)
export const isConnecting = atom(false)
export const isSwitchingNetwork = atom(false)
export const walletAccount = atom(null)
export const targetNetwork = atom(baseSepolia)
export const isAutoConnecting = atom(false)

// Computed atoms
export const isBaseNetwork = atom((get) => {
    const account = get(walletAccount)
    const target = get(targetNetwork)
    return account?.chainId === target.id
})

// Actions
export const connectWallet = async (connectorType) => {
    isConnecting.set(true)
    try {
        // First check if we're already connected
        const currentAccount = getAccount(wagmiConfig)
        if (currentAccount?.isConnected) {
            walletAccount.set(currentAccount)
            isConnected.set(true)
            return
        }

        const _connectors = getConnectors(wagmiConfig)
        const connector = connectorType === 'browser' ? _connectors[0] : _connectors[1]
        await connect(wagmiConfig, { connector })
        const account = getAccount(wagmiConfig)
        if(account) {
            walletAccount.set(account)
            isConnected.set(account.isConnected)
            
            // Check if we need to switch network after connection
            if (account.chainId !== baseSepolia.id) {
                window.dispatchEvent(new Event('switch-to-base'))
            }
        }
    } catch (error) {
        console.error('Error connecting wallet:', error)
        // If we get an already connected error, try to get the current account
        if (error.message?.includes('already connected')) {
            const account = getAccount(wagmiConfig)
            if (account) {
                walletAccount.set(account)
                isConnected.set(account.isConnected)
            }
        }
    } finally {
        isConnecting.set(false)
    }
}

export const disconnectWallet = async () => {
    try {
        await disconnect(wagmiConfig)
        isConnected.set(false)
        walletAccount.set(null)
    } catch (error) {
        console.error('Error disconnecting wallet:', error)
    }
}

export const switchToBase = async () => {
    isSwitchingNetwork.set(true)
    try {
        await switchChain(wagmiConfig, { chainId: baseSepolia.id })
        const account = getAccount(wagmiConfig)
        if(account) {
            walletAccount.set(account)
            isConnected.set(account.isConnected)
        }
    } catch (error) {
        console.error('Error switching network:', error)
    } finally {
        isSwitchingNetwork.set(false)
    }
}

// Initialize wallet connection
export const initializeWallet = async () => {
    isAutoConnecting.set(true)
    try {
        await reconnect(wagmiConfig)
        const account = getAccount(wagmiConfig)
        if(account) {
            walletAccount.set(account)
            isConnected.set(account.isConnected)
            
            // Check if we need to switch network after initialization
            if (account.chainId !== baseSepolia.id) {
                window.dispatchEvent(new Event('switch-to-base'))
            }
        }
    } catch (error) {
        console.error('Error initializing wallet:', error)
    } finally {
        isAutoConnecting.set(false)
    }
}

// Subscribe to wallet events
export const subscribeToWalletEvents = () => {
    window.addEventListener('connect-wallet', connectWallet)
    window.addEventListener('disconnect-wallet', disconnectWallet)
    window.addEventListener('switch-to-base', switchToBase)
}

export const unsubscribeFromWalletEvents = () => {
    window.removeEventListener('connect-wallet', connectWallet)
    window.removeEventListener('disconnect-wallet', disconnectWallet)
    window.removeEventListener('switch-to-base', switchToBase)
} 