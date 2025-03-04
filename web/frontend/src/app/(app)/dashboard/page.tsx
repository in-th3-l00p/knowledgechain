'use client'

import { Fragment, useState, useEffect } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ArrowPathIcon,
  ArrowUpCircleIcon,
  EllipsisHorizontalIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WalletIcon,
} from '@heroicons/react/20/solid'
import { useAuth } from '@/hooks/useAuth'
import api from "@/utils/api";
import { useAccount } from 'wagmi'
const secondaryNavigation = [
  { name: 'Last 7 days', href: '#', current: true },
  { name: 'Last 30 days', href: '#', current: false },
  { name: 'All-time', href: '#', current: false },
]

const stats = [
  { name: 'Courses Completed', value: '12', change: '+3', changeType: 'positive' },
  { name: 'Articles Created', value: '5', change: '+2', changeType: 'positive' },
  { name: 'Learning Hours', value: '45.5', change: '+10.2', changeType: 'positive' },
  { name: 'Certificates Earned', value: '3', change: '+1', changeType: 'positive' },
]

const statuses = {
  Completed: 'text-green-700 bg-green-50 ring-green-600/20',
  InProgress: 'text-blue-700 bg-blue-50 ring-blue-600/20',
  NotStarted: 'text-gray-600 bg-gray-50 ring-gray-500/10',
  Earned: 'text-purple-700 bg-purple-50 ring-purple-600/20',
}

// Recent activity data
const days = [
  {
    date: 'Today',
    dateTime: '2023-06-15',
    activities: [
      {
        id: 1,
        activityNumber: 'ACT-001',
        href: '#',
        title: 'Blockchain Fundamentals',
        status: 'Completed',
        type: 'Course',
        description: 'Completed the final module',
        icon: AcademicCapIcon,
      },
      {
        id: 2,
        activityNumber: 'ACT-002',
        href: '#',
        title: 'Smart Contract Development',
        status: 'InProgress',
        type: 'Course',
        description: 'Started module 3 of 5',
        icon: ArrowPathIcon,
      },
      {
        id: 3,
        activityNumber: 'ACT-003',
        href: '#',
        title: 'Web3 Security Certificate',
        status: 'Earned',
        type: 'Certificate',
        description: 'Earned after completing assessment',
        icon: ArrowUpCircleIcon,
      },
    ],
  },
  {
    date: 'Yesterday',
    dateTime: '2023-06-14',
    activities: [
      {
        id: 4,
        activityNumber: 'ACT-004',
        href: '#',
        title: 'DeFi Principles',
        status: 'InProgress',
        type: 'Course',
        description: 'Completed 2 modules',
        icon: ArrowPathIcon,
      },
    ],
  },
]

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const [userArticles, setUserArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const {
    user, 
    isAuthenticated, 
    isLoading: authLoading, 
    isConnectingWallet, 
    connectWallet, 
    disconnectWallet 
  } = useAuth()
  const { address, isConnected: isWagmiConnected } = useAccount()

  useEffect(() => {
    const fetchUserArticles = async () => {
      if (!user?.id) return
      
      try {
        setIsLoading(true)
        const response = await api.get('/api/articles/', {
          params: {
            authorId: user.id,
            status: 'PUBLISHED',
            take: 3,
            orderBy: {
              updatedAt: 'desc'
            }
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.data && response.data.data) {
          setUserArticles(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch user articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchUserArticles().then(() => {});
    }
  }, [isAuthenticated, user?.id])

  const handleConnectWallet = async () => {
    await connectWallet();
  }

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <main>
        <div className="relative isolate overflow-hidden">
          {/* Secondary navigation */}
          <header className="pb-4 pt-6 sm:pb-6">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
              <h1 className="text-base/7 font-semibold text-gray-900">Learning Dashboard</h1>
              <div className="order-last flex w-full gap-x-8 text-sm/6 font-semibold sm:order-none sm:w-auto sm:border-l sm:border-gray-200 sm:pl-6 sm:text-sm/7">
                {secondaryNavigation.map((item) => (
                  <a key={item.name} href={item.href} className={item.current ? 'text-indigo-600' : 'text-gray-700'}>
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-x-4">
                {isWagmiConnected ? (
                  <div className="flex items-center gap-x-2">
                    <WalletIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700 truncate max-w-[120px]">
                      {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                    </span>
                    <button
                      onClick={handleDisconnectWallet}
                      className="text-xs text-red-600 hover:text-red-500"
                      disabled={isConnectingWallet}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    className="flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    disabled={isConnectingWallet}
                  >
                    <WalletIcon aria-hidden="true" className="-ml-0.5 size-5" />
                    {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
                <a
                  href="/dashboard/create-article"
                  className="flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  New Article
                </a>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
            <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
              {stats.map((stat, statIdx) => (
                <div
                  key={stat.name}
                  className={classNames(
                    statIdx % 2 === 1 ? 'sm:border-l' : statIdx === 2 ? 'lg:border-l' : '',
                    'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8',
                  )}
                >
                  <dt className="text-sm/6 font-medium text-gray-500">{stat.name}</dt>
                  <dd
                    className={classNames(
                      stat.changeType === 'negative' ? 'text-rose-600' : 'text-green-600',
                      'text-xs font-medium',
                    )}
                  >
                    {stat.change}
                  </dd>
                  <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            aria-hidden="true"
            className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
          >
            <div
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
              className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
            />
          </div>
        </div>

        <div className="space-y-16 py-16 xl:space-y-20">
          {/* Recent activity table */}
          <div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mx-auto max-w-2xl text-base font-semibold text-gray-900 lg:mx-0 lg:max-w-none">
                Recent learning activity
              </h2>
            </div>
            <div className="mt-6 overflow-hidden border-t border-gray-100">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                  <table className="w-full text-left">
                    <thead className="sr-only">
                      <tr>
                        <th>Title</th>
                        <th className="hidden sm:table-cell">Type</th>
                        <th>More details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <Fragment key={day.dateTime}>
                          <tr className="text-sm/6 text-gray-900">
                            <th scope="colgroup" colSpan={3} className="relative isolate py-2 font-semibold">
                              <time dateTime={day.dateTime}>{day.date}</time>
                              <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                              <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                            </th>
                          </tr>
                          {day.activities.map((activity) => (
                            <tr key={activity.id}>
                              <td className="relative py-5 pr-6">
                                <div className="flex gap-x-6">
                                  <activity.icon
                                    aria-hidden="true"
                                    className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                                  />
                                  <div className="flex-auto">
                                    <div className="flex items-start gap-x-3">
                                      <div className="text-sm/6 font-medium text-gray-900">{activity.title}</div>
                                      <div
                                        className={classNames(
                                          statuses[activity.status as keyof typeof statuses],
                                          'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                                        )}
                                      >
                                        {activity.status}
                                      </div>
                                    </div>
                                    <div className="mt-1 text-xs/5 text-gray-500">{activity.description}</div>
                                  </div>
                                </div>
                                <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                                <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                              </td>
                              <td className="hidden py-5 pr-6 sm:table-cell">
                                <div className="text-sm/6 text-gray-900">{activity.type}</div>
                              </td>
                              <td className="py-5 text-right">
                                <div className="flex justify-end">
                                  <a
                                    href={activity.href}
                                    className="text-sm/6 font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    View<span className="hidden sm:inline"> details</span>
                                    <span className="sr-only">
                                      , activity #{activity.activityNumber}, {activity.title}
                                    </span>
                                  </a>
                                </div>
                                <div className="mt-1 text-xs/5 text-gray-500">
                                  Activity <span className="text-gray-900">#{activity.activityNumber}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Recent articles list */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="flex items-center justify-between">
                <h2 className="text-base/7 font-semibold text-gray-900">Your Articles</h2>
                <a href="/dashboard/my-articles" className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500">
                  View all<span className="sr-only">, articles</span>
                </a>
              </div>
              
              {isLoading ? (
                <div className="mt-6 text-center">Loading your articles...</div>
              ) : userArticles.length > 0 ? (
                <ul role="list" className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                  {userArticles.map((article: any) => (
                    <li key={article.id} className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                        <img
                          alt={article.title}
                          src={article.video?.thumbnail || "https://placehold.co/100x100?text=Article"}
                          className="size-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                        />
                        <div className="text-sm/6 font-medium text-gray-900">{article.title}</div>
                        <Menu as="div" className="relative ml-auto">
                          <MenuButton className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Open options</span>
                            <EllipsisHorizontalIcon aria-hidden="true" className="size-5" />
                          </MenuButton>
                          <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                          >
                            <MenuItem>
                              <a
                                href={`/dashboard/articles/${article.id}`}
                                className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
                              >
                                View<span className="sr-only">, {article.title}</span>
                              </a>
                            </MenuItem>
                            <MenuItem>
                              <a
                                href={`/dashboard/articles/${article.id}/edit`}
                                className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
                              >
                                Edit<span className="sr-only">, {article.title}</span>
                              </a>
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </div>
                      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm/6">
                        <div className="flex justify-between gap-x-4 py-3">
                          <dt className="text-gray-500">Last updated</dt>
                          <dd className="text-gray-700">
                            <time dateTime={article.updatedAt}>{new Date(article.updatedAt).toLocaleDateString()}</time>
                          </dd>
                        </div>
                        <div className="flex justify-between gap-x-4 py-3">
                          <dt className="text-gray-500">Status</dt>
                          <dd className="flex items-start gap-x-2">
                            <div
                              className={classNames(
                                statuses[article.status as keyof typeof statuses] || statuses.NotStarted,
                                'rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                              )}
                            >
                              {article.status}
                            </div>
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6 text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No articles</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't created any articles yet.</p>
                  <div className="mt-6">
                    <a
                      href="/dashboard/create-article"
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Create article
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Explore section */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="flex items-center justify-between">
                <h2 className="text-base/7 font-semibold text-gray-900">Explore New Articles</h2>
                <a href="/dashboard/explore" className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500">
                  Browse all<span className="sr-only">, articles</span>
                </a>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
                <div className="divide-y divide-gray-200">
                  {[
                    { id: "101", title: "NFT Development Masterclass", author: "Alex Johnson", difficulty: "Intermediate", duration: "8 hours" },
                    { id: "102", title: "Web3 Security Fundamentals", author: "Sarah Chen", difficulty: "Advanced", duration: "12 hours" },
                    { id: "103", title: "Introduction to DAOs", author: "Michael Rodriguez", difficulty: "Beginner", duration: "5 hours" },
                  ].map((course, idx) => (
                    <div key={course.id} className="flex items-center gap-x-4 p-6">
                      <BookOpenIcon className="h-8 w-8 flex-none text-indigo-600" />
                      <div className="flex-auto">
                        <div className="font-semibold text-gray-900">{course.title}</div>
                        <div className="mt-1 flex text-xs text-gray-500">
                          <div>{course.author}</div>
                          <div className="ml-4 border-l border-gray-200 pl-4">{course.difficulty}</div>
                          <div className="ml-4 border-l border-gray-200 pl-4">{course.duration}</div>
                        </div>
                      </div>
                      <a
                        href={`/dashboard/explore/${course.id}`}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
                      >
                        View Details
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
