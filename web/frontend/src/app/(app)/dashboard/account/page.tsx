'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
  UserIcon,
  KeyIcon,
  WalletIcon,
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import api from '@/utils/api'

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, connectWallet, disconnectWallet, logout } = useAuth()
  const { address, isConnected: isWagmiConnected } = useAccount()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', message: '' })
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' })
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      })
    }
  }, [user])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value
    })
  }
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) return
    
    try {
      setIsUpdating(true)
      const response = await api.put(`/api/users/${user.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      setFeedbackMessage({
        type: 'success',
        message: 'Profile updated successfully!'
      })
      
      // Clear the feedback message after 3 seconds
      setTimeout(() => {
        setFeedbackMessage({ type: '', message: '' })
      }, 3000)
    } catch (error: any) {
      setFeedbackMessage({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update profile'
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) return
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New passwords do not match'
      })
      return
    }
    
    try {
      setIsChangingPassword(true)
      // Note: You'll need to implement the password update API endpoint
      const response = await api.put(`/api/users/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      setPasswordFeedback({
        type: 'success',
        message: 'Password updated successfully!'
      })
      
      // Reset the password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Clear the feedback message after 3 seconds
      setTimeout(() => {
        setPasswordFeedback({ type: '', message: '' })
      }, 3000)
    } catch (error: any) {
      setPasswordFeedback({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update password'
      })
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  const handleConnectWallet = async () => {
    await connectWallet()
  }
  
  const handleDisconnectWallet = async () => {
    await disconnectWallet()
  }
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Account Settings</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Manage your profile information and connected wallet.
          </p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl lg:col-span-2">
          {/* Profile Information */}
          <div className="px-4 py-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
              {feedbackMessage.message && (
                <div className={classNames(
                  "flex items-center rounded-md py-1 px-3 text-sm",
                  feedbackMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                )}>
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                  )}
                  {feedbackMessage.message}
                </div>
              )}
            </div>
            
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Password Change */}
          <div className="px-4 py-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
              {passwordFeedback.message && (
                <div className={classNames(
                  "flex items-center rounded-md py-1 px-3 text-sm",
                  passwordFeedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                )}>
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                  )}
                  {passwordFeedback.message}
                </div>
              )}
            </div>
            
            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-gray-900">
                    Current password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900">
                    New password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                    Confirm new password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {isChangingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Wallet Connection */}
          <div className="px-4 py-6 sm:p-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Wallet Connection</h3>
            <div className="mt-6">
              {isWagmiConnected ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <WalletIcon className="h-8 w-8 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Wallet Connected</p>
                      <p className="text-sm text-gray-500">
                        {address?.substring(0, 10)}...{address?.substring(address.length - 8)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectWallet}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-600 hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8">
                  <WalletIcon className="h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No wallet connected</h3>
                  <p className="mt-1 text-sm text-gray-500">Connect your wallet to verify ownership of your assets.</p>
                  <button
                    onClick={handleConnectWallet}
                    className="mt-4 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Logout Button */}
          <div className="px-4 py-6 sm:p-8">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2 text-gray-500" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 