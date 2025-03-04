"use client";

import {createContext, ReactNode, useEffect, useState} from "react";
import api from "@/utils/api";
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface User {
    id: string
    name: string
    email: string
}

interface Wallet {
    id?: string
    address: string
    userId: string
}

interface AuthContextType {
    user: User | null
    wallet: Wallet | null
    isAuthenticated: boolean
    isLoading: boolean
    isConnectingWallet: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    connectWallet: () => Promise<void>
    disconnectWallet: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    wallet: null,
    isAuthenticated: false,
    isLoading: true,
    isConnectingWallet: false,
    login: async () => {},
    logout: () => {},
    connectWallet: async () => {},
    disconnectWallet: async () => {},
})

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnectingWallet, setIsConnectingWallet] = useState(false)

    const { address, isConnected } = useAccount()
    const { connectAsync, connectors } = useConnect()
    const { disconnectAsync } = useDisconnect()

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.status === 200)
                    setUser(response.data)
            } catch (error) {
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth().then(() => {});
    }, [])

    useEffect(() => {
        const fetchUserWallet = async () => {
            if (!user?.id) return;

            try {
                const response = await api.get(`/api/users/wallets/user/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (response.data) {
                    setWallet(response.data);
                } else {
                    setWallet(null);
                }
            } catch (error) {
                console.error('Failed to fetch user wallet:', error);
                setWallet(null);
            }
        };

        fetchUserWallet();
    }, [user?.id, isConnected]);

    useEffect(() => {
        const updateWalletInDB = async () => {
            if (!user?.id || !address || !isConnected) return;

            if (wallet?.address === address) return;

            try {
                setIsConnectingWallet(true);

                if (wallet?.id) {
                    // Update existing wallet
                    await api.put(`/api/users/wallets/${wallet.id}`, {
                        address,
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });
                } else {
                    // Create new wallet
                    const response = await api.post('/api/users/wallets', {
                        address,
                        userId: user.id
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });

                    setWallet(response.data);
                }
            } catch (error) {
                console.error('Failed to update wallet in database:', error);
            } finally {
                setIsConnectingWallet(false);
            }
        };

        updateWalletInDB();
    }, [user?.id, address, isConnected, wallet?.id, wallet?.address]);

    const login = async (email: string, password: string) => {
        setIsLoading(true)

        try {
            const response = await api.post('/api/auth/login', {email, password})
            localStorage.setItem('accessToken', response.data.accessToken)
            setUser(response.data.user)

            return response.data
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (token) {
                await api.post('/api/auth/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('accessToken')
            setUser(null)
        }
    }

    const connectWallet = async () => {
        try {
            setIsConnectingWallet(true);
            const connector = connectors[0];
            await connectAsync({ connector });
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setIsConnectingWallet(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            await disconnectAsync();
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    };

    const value = {
        user,
        wallet,
        isAuthenticated: !!user,
        isLoading,
        isConnectingWallet,
        login,
        logout,
        connectWallet,
        disconnectWallet
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}