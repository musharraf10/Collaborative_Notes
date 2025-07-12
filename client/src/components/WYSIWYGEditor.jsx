import { useState, useRef, useEffect } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'

function WYSIWYGEditor({ content, onChange, placeholder }) {
  const editorRef = useRef(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || ''
    }
  }, [content])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const formatButtons = [
    { command: 'bold', icon: BoldIcon, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: ItalicIcon, title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: UnderlineIcon, title: 'Underline (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: ListBulletIcon, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: NumberedListIcon, title: 'Numbered List' },
    { command: 'formatBlock', icon: CodeBracketIcon, title: 'Code Block', value: 'pre' },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center space-x-1">
          {formatButtons.map(({ command, icon: Icon, title, value }) => (
            <button
              key={command}
              type="button"
              onClick={() => executeCommand(command, value)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title={title}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <button
            type="button"
            onClick={insertLink}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        className={`min-h-[300px] p-4 outline-none prose prose-sm max-w-none ${
          isEditorFocused ? 'ring-2 ring-blue-500 ring-inset' : ''
        }`}
        style={{
          lineHeight: '1.6',
          fontSize: '16px',
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          padding: 12px;
          border-radius: 6px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          overflow-x: auto;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 20px;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default WYSIWYGEditor