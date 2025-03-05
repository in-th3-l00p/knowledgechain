"use client";

import { Fragment, useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', current: false },
  { name: 'Account', href: '/dashboard/account', current: false },
]

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  
  // Get the current path to determine which nav item is active
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname
    }
    return ''
  }
  
  // Set the current navigation item
  const currentPath = getCurrentPath()
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: currentPath === item.href || currentPath.startsWith(`${item.href}/`)
  }))
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50 flex h-16 border-b border-gray-900/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-x-6">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="-m-3 p-3 md:hidden">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-5 text-gray-900" />
            </button>
            <img
              alt="Web3 Education"
              src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </div>
          <nav className="hidden md:flex md:gap-x-11 md:text-sm/6 md:font-semibold md:text-gray-700">
            {updatedNavigation.map((item, itemIdx) => (
              <a 
                key={itemIdx} 
                href={item.href}
                className={item.current ? 'text-indigo-600' : ''}
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="flex flex-1 items-center justify-end gap-x-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="size-6" />
            </button>
            <a href="/dashboard/account" className="-m-1.5 p-1.5">
              <span className="sr-only">Your profile</span>
              <img
                alt=""
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="size-8 rounded-full bg-gray-800"
              />
            </a>
          </div>
        </div>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-4 pb-6 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10">
            <div className="-ml-0.5 flex h-16 items-center gap-x-6">
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 p-2.5 text-gray-700">
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
              <div className="-ml-0.5">
                <a href="#" className="-m-1.5 block p-1.5">
                  <span className="sr-only">Web3 Education</span>
                  <img
                    alt=""
                    src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {updatedNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-50 text-indigo-600' : 'text-gray-900 hover:bg-gray-50',
                    '-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold'
                  )}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="pt-16">
        {children}
      </div>
    </>
  )
}