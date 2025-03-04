'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '@/utils/api'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowLeftIcon,
  ClockIcon,
  EyeIcon,
  TagIcon,
  FolderIcon,

} from '@heroicons/react/20/solid'
import { CalendarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const statuses = {
  DRAFT: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  PENDING_REVIEW: 'text-orange-700 bg-orange-50 ring-orange-600/20',
  PUBLISHED: 'text-green-700 bg-green-50 ring-green-600/20',
  ARCHIVED: 'text-gray-600 bg-gray-50 ring-gray-500/10',
}

export default function ArticleView() {
  const { id } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await api.get(`/api/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.data) {
          setArticle(response.data)
        }
      } catch (err: any) {
        console.error('Failed to fetch article:', err)
        setError(err.response?.data?.message || 'Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchArticle()
    }
  }, [id, isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading article...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-300 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-600">
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  // Format the publishedAt date
  const publishedDate = article.publishedAt 
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not published yet'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to dashboard link */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600">
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Article header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
          
          {user?.id === article.authorId && (
            <Link 
              href={`/dashboard/articles/${article.id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Article
            </Link>
          )}
        </div>
        
        {/* Article metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Published: {publishedDate}</span>
          </div>
          
          <div className="flex items-center gap-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-x-1">
            <EyeIcon className="h-4 w-4" />
            <span>{article.views} views</span>
          </div>
          
          <div className={`flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statuses[article.status as keyof typeof statuses]}`}>
            {article.status}
          </div>
        </div>
      </div>

      {/* Video section (if available) */}
      {article.video && (
        <div className="mb-8 rounded-lg overflow-hidden border border-gray-200">
          <div className="aspect-video relative bg-gray-100">
            {article.video.url ? (
              <iframe
                src={article.video.url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                frameBorder="0"
                title={article.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <img
                  src={article.video.thumbnail || "https://placehold.co/800x450?text=Video+Thumbnail"}
                  alt={`Thumbnail for ${article.title}`}
                  className="max-h-full object-cover"
                />
              </div>
            )}
          </div>
          {article.video.duration && (
            <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Duration: {Math.floor(article.video.duration / 60)}:{(article.video.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      )}

      {/* Article summary */}
      {article.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Summary</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700 italic">
            {article.summary}
          </div>
        </div>
      )}

      {/* Article content */}
      <div className="prose prose-indigo max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Tags and Categories */}
      <div className="flex flex-wrap gap-4 mb-8">
        {article.tags && article.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <TagIcon className="h-4 w-4 mr-1" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tagRelation: any) => (
                <span 
                  key={tagRelation.tagId} 
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                >
                  {tagRelation.tag?.name || 'Unknown tag'}
                </span>
              ))}
            </div>
          </div>
        )}

        {article.categories && article.categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <FolderIcon className="h-4 w-4 mr-1" />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.categories.map((categoryRelation: any) => (
                <span 
                  key={categoryRelation.categoryId} 
                  className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                >
                  {categoryRelation.category?.name || 'Unknown category'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 