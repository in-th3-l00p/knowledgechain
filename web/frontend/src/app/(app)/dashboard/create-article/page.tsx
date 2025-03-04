'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlock from '@tiptap/extension-code-block'
import { 
  XMarkIcon, 
  PhotoIcon,
  CodeBracketIcon,
  LinkIcon,
  ListBulletIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import api from '@/utils/api'

export default function CreateArticle() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Article form state
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PENDING_REVIEW'>('DRAFT')
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState('')
  
  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your article content here...'
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlock,
    ],
    content: '',
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })
  
  const handleSubmit = async (asDraft = false) => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      setError('Content is required')
      return
    }
    
    if (!user?.id) {
      setError('You must be logged in to create an article')
      return
    }
    
    try {
      asDraft ? setIsSavingDraft(true) : setIsSubmitting(true)
      setError('')
      
      // Create the article
      const articleData = {
        title: title.trim(),
        content: editor?.getHTML(),
        summary: summary.trim(),
        authorId: user.id,
        status: asDraft ? 'DRAFT' : 'PENDING_REVIEW',
        published: !asDraft
      }
      
      const response = await api.post('/api/articles/', articleData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const articleId = response.data.id
      
      // Redirect to the article or my articles page
      router.push(asDraft 
        ? `/dashboard/articles/${articleId}/edit` 
        : '/dashboard/my-articles'
      )
      
    } catch (error: any) {
      console.error('Failed to create article:', error)
      setError(error.response?.data?.message || 'Failed to create article')
    } finally {
      setIsSubmitting(false)
      setIsSavingDraft(false)
    }
  }
  
  // Editor toolbar controls
  const setLink = useCallback(() => {
    if (!editor) return
    
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    
    if (url === null) return
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])
  
  const addImage = useCallback(() => {
    if (!editor) return
    
    const url = window.prompt('Image URL')
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
        <div className="flex gap-x-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSavingDraft || isSubmitting}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || isSavingDraft}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Article Metadata */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Article title"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="summary" className="block text-sm font-medium leading-6 text-gray-900">
                  Summary
                </label>
                <div className="mt-2">
                  <textarea
                    id="summary"
                    name="summary"
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Brief summary of your article"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* WYSIWYG Editor */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor?.can().chain().focus().toggleBold().run()}
              className={`rounded p-1 ${
                editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-600">
                <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5Zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5ZM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8Z"/>
              </svg>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor?.can().chain().focus().toggleItalic().run()}
              className={`rounded p-1 ${
                editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Italic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-600">
                <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15v2Z"/>
              </svg>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`rounded p-1 ${
                editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Heading 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-600">
                <path d="M13 20h-2v-7H4v7H2V4h2v7h7V4h2v16Z"/>
              </svg>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`rounded p-1 ${
                editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Heading 2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-600">
                <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2Z"/>
                <path d="M18.5 20a1.5 1.5 0 0 0 1.5-1.5v-3l-1.6 1.5L17 16v4h1.5Z"/>
              </svg>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`rounded p-1 ${
                editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Heading 3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-600">
                <path d="M22 8l-4-4v3H3v2h15v3l4-4Z"/>
                <path d="M2 20h20v-8H2v8Zm9-6h2v4h-2v-4Z"/>
              </svg>
            </button>
            <div className="h-6 mx-1 w-px bg-gray-300" />
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`rounded p-1 ${
                editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Bullet List"
            >
              <ListBulletIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`rounded p-1 ${
                editor?.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Ordered List"
            >
              <ListBulletIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="h-6 mx-1 w-px bg-gray-300" />
            <button
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={`rounded p-1 ${
                editor?.isActive('codeBlock') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Code Block"
            >
              <CodeBracketIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={setLink}
              className={`rounded p-1 ${
                editor?.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Link"
            >
              <LinkIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={addImage}
              className="rounded p-1 hover:bg-gray-100"
              title="Image"
            >
              <PhotoIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="h-6 mx-1 w-px bg-gray-300" />
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().chain().focus().undo().run()}
              className="rounded p-1 hover:bg-gray-100"
              title="Undo"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().chain().focus().redo().run()}
              className="rounded p-1 hover:bg-gray-100"
              title="Redo"
            >
              <ArrowUturnRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <EditorContent editor={editor} className="min-h-[500px] bg-white" />
        </div>
      </div>
    </div>
  )
} 