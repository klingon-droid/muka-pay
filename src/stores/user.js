import { atom } from 'nanostores'

export const username = atom('')

export function setUsername(name) {
    console.log('setting username:', name)
    username.set(name)
} 