'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Video,
  Upload,
  Type,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface MediaFile {
  file: File;
  url: string;
  type: 'image' | 'video';
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your blog post...",
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);

  const fonts = [
    'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 
    'Verdana', 'Courier New', 'Monaco', 'Roboto', 'Open Sans',
    'Lato', 'Montserrat', 'Poppins', 'Playfair Display', 'Merriweather'
  ];

  const colors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280',
    '#374151', '#1f2937', '#111827', '#000000', '#fef2f2', '#fee2e2',
    '#fecaca', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#7f1d1d', '#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#d97706',
    '#b45309', '#92400e', '#78350f', '#ecfdf5', '#d1fae5', '#a7f3d0',
    '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46',
    '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6',
    '#2563eb', '#1d4ed8', '#1e40af', '#f3e8ff', '#e9d5ff', '#d8b4fe',
    '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#5b21b6'
  ];

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      // Ensure text direction remains LTR after any command
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Initialize editor with proper text direction and input handling
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      // Set initial attributes
      editor.setAttribute('dir', 'ltr');
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
      editor.style.unicodeBidi = 'embed';
      
      // Intercept text input to prevent reversal
      const handleBeforeInput = (e: InputEvent) => {
        if (e.inputType === 'insertText' && e.data) {
          e.preventDefault();
          
          // Get current selection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Create a text node with proper direction
            const textNode = document.createTextNode(e.data);
            
            // Insert the text
            range.deleteContents();
            range.insertNode(textNode);
            
            // Move cursor after inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Trigger change
            handleEditorChange();
          }
        }
      };
      
      // Add beforeinput event listener
      editor.addEventListener('beforeinput', handleBeforeInput);
      
      // Add mutation observer to prevent direction changes
      const observer = new MutationObserver(() => {
        if (editor.getAttribute('dir') !== 'ltr') {
          editor.setAttribute('dir', 'ltr');
          editor.style.direction = 'ltr';
          editor.style.textAlign = 'left';
        }
        
        // Fix all child elements
        const allElements = editor.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          if (el.getAttribute('dir') !== 'ltr') {
            (el as HTMLElement).setAttribute('dir', 'ltr');
            (el as HTMLElement).style.direction = 'ltr';
            (el as HTMLElement).style.unicodeBidi = 'embed';
          }
        });
      });
      
      observer.observe(editor, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['dir', 'style']
      });
      
      return () => {
        editor.removeEventListener('beforeinput', handleBeforeInput);
        observer.disconnect();
      };
    }
  }, []);

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    executeCommand('fontName', font);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    executeCommand('foreColor', color);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} is not a supported image or video format`);
        continue;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        file,
        url,
        type: isImage ? 'image' : 'video'
      };

      setUploadedMedia(prev => [...prev, mediaFile]);

      // Insert into editor
      const mediaElement = isImage 
        ? `<img src="${url}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`
        : `<video src="${url}" controls style="max-width: 100%; height: auto; margin: 10px 0;"></video>`;

      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createRange().createContextualFragment(mediaElement));
        } else {
          editorRef.current.innerHTML += mediaElement;
        }
        onChange(editorRef.current.innerHTML);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      
      if (editorRef.current) {
        document.execCommand('insertHTML', false, tableHTML);
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      // Get current selection
      const selection = window.getSelection();
      let cursorPosition = 0;
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        cursorPosition = range.startOffset;
      }
      
      // Fix text direction issues by ensuring LTR
      let content = editorRef.current.innerHTML;
      
      // Force text direction in content
      content = content.replace(/<([^>]+)>/g, (match, tag) => {
        if (!tag.includes('dir=')) {
          return match.replace('>', ' dir="ltr">');
        }
        return match.replace(/dir="[^"]*"/, 'dir="ltr"');
      });
      
      onChange(content);
      
      // Force LTR direction on the editor and all children
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      editorRef.current.setAttribute('dir', 'ltr');
      
      // Fix all child elements
      const allElements = editorRef.current.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        (el as HTMLElement).setAttribute('dir', 'ltr');
        (el as HTMLElement).style.direction = 'ltr';
        (el as HTMLElement).style.unicodeBidi = 'embed';
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          executeCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          executeCommand('redo');
          break;
      }
    }

    // Fix text direction issues
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand('insertHTML', '<br><br>');
    }

    // Prevent text reversal by ensuring proper cursor position
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.style.direction = 'ltr';
        editorRef.current.style.textAlign = 'left';
        
        // Force all child elements to be LTR
        const allElements = editorRef.current.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          (el as HTMLElement).style.direction = 'ltr';
          (el as HTMLElement).style.unicodeBidi = 'embed';
        });
      }
    }, 0);
  };

  const handleSelectionChange = () => {
    // Update toolbar state based on current selection
    if (editorRef.current && document.getSelection) {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
        // You can add logic here to update toolbar button states
        // based on the current selection formatting
      }
    }
  };

  return (
    <div className={`border border-gray-700 rounded-lg overflow-hidden bg-gray-800 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-3 bg-gray-900">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-gray-600 pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('bold')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('italic')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('underline')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('strikeThrough')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-600 pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('justifyLeft')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('justifyCenter')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('justifyRight')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('justifyFull')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-600 pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('insertUnorderedList')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('insertOrderedList')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => executeCommand('formatBlock', 'blockquote')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* Font Selection */}
          <div className="flex gap-2 border-r border-gray-600 pr-2">
            <select
              value={selectedFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
            >
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          {/* Color Picker */}
          <div className="flex gap-1 border-r border-gray-600 pr-2">
            <div className="flex flex-wrap gap-1 max-w-48">
              {colors.slice(0, 12).map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Media & Links */}
          <div className="flex gap-1 border-r border-gray-600 pr-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={insertLink}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={insertTable}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="relative">
        {isPreviewMode ? (
          <div 
            className="p-4 min-h-96 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            dir="ltr"
            onInput={handleEditorChange}
            onPaste={handleEditorChange}
            onKeyDown={handleKeyDown}
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            className="p-4 min-h-96 text-white focus:outline-none rich-text-editor"
            style={{ 
              fontFamily: selectedFont,
              color: selectedColor,
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'embed'
            }}
            dangerouslySetInnerHTML={{ __html: value }}
            data-placeholder={placeholder}
            spellCheck="false"
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Media Preview */}
      {uploadedMedia.length > 0 && (
        <div className="border-t border-gray-700 p-3 bg-gray-900">
          <Label className="text-sm text-gray-300 mb-2 block">Uploaded Media:</Label>
          <div className="flex flex-wrap gap-2">
            {uploadedMedia.map((media, index) => (
              <div key={index} className="relative group">
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt={media.file.name}
                    className="w-16 h-16 object-cover rounded border border-gray-600"
                  />
                ) : (
                  <video 
                    src={media.url}
                    className="w-16 h-16 object-cover rounded border border-gray-600"
                  />
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    URL.revokeObjectURL(media.url);
                    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .rich-text-editor {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: embed !important;
          writing-mode: horizontal-tb !important;
          text-orientation: mixed !important;
          -webkit-writing-mode: horizontal-tb !important;
          -ms-writing-mode: horizontal-tb !important;
        }
        
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          font-style: italic;
          pointer-events: none;
        }
        
        .rich-text-editor * {
          direction: ltr !important;
          text-align: inherit !important;
        }
        
        .rich-text-editor img, .rich-text-editor video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
          display: block;
        }
        
        .rich-text-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
          direction: ltr !important;
        }
        
        .rich-text-editor td, .rich-text-editor th {
          border: 1px solid #4b5563;
          padding: 8px;
          text-align: left;
          direction: ltr !important;
        }
        
        .rich-text-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #d1d5db;
          direction: ltr !important;
        }
        
        .rich-text-editor code {
          background-color: #374151;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          direction: ltr !important;
        }
        
        .rich-text-editor a {
          color: #60a5fa;
          text-decoration: underline;
        }
        
        .rich-text-editor a:hover {
          color: #93c5fd;
        }
        
        .rich-text-editor strong, .rich-text-editor b {
          font-weight: bold;
          color: #fbbf24;
          text-shadow: 0 0 2px rgba(251, 191, 36, 0.3);
        }
        
        .rich-text-editor em, .rich-text-editor i {
          font-style: italic;
          color: #a78bfa;
          text-shadow: 0 0 2px rgba(167, 139, 250, 0.3);
        }
        
        .rich-text-editor u {
          text-decoration: underline;
          text-decoration-color: #34d399;
          text-underline-offset: 2px;
        }
        
        .rich-text-editor s, .rich-text-editor strike {
          text-decoration: line-through;
          text-decoration-color: #ef4444;
          opacity: 0.8;
        }
        
        .rich-text-editor h1, .rich-text-editor h2, .rich-text-editor h3,
        .rich-text-editor h4, .rich-text-editor h5, .rich-text-editor h6 {
          color: #f3f4f6;
          font-weight: bold;
          margin: 16px 0 8px 0;
          line-height: 1.2;
        }
        
        .rich-text-editor h1 { font-size: 2rem; color: #60a5fa; }
        .rich-text-editor h2 { font-size: 1.75rem; color: #8b5cf6; }
        .rich-text-editor h3 { font-size: 1.5rem; color: #10b981; }
        .rich-text-editor h4 { font-size: 1.25rem; color: #f59e0b; }
        .rich-text-editor h5 { font-size: 1.125rem; color: #ef4444; }
        .rich-text-editor h6 { font-size: 1rem; color: #6b7280; }
        
        .rich-text-editor ul, .rich-text-editor ol {
          margin: 10px 0;
          padding-left: 20px;
          direction: ltr !important;
        }
        
        .rich-text-editor li {
          margin: 4px 0;
          direction: ltr !important;
        }
        
        .rich-text-editor p {
          margin: 8px 0;
          line-height: 1.6;
          direction: ltr !important;
        }
        
        /* Selection highlighting */
        .rich-text-editor ::selection {
          background-color: rgba(59, 130, 246, 0.3);
          color: #ffffff;
        }
        
        /* Focus styles */
        .rich-text-editor:focus {
          outline: none;
          box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        /* Prevent text reversal */
        .rich-text-editor * {
          unicode-bidi: embed !important;
          direction: ltr !important;
          text-align: inherit !important;
        }
        
        /* Fix for RTL text input issues */
        .rich-text-editor input, .rich-text-editor textarea {
          direction: ltr !important;
          text-align: left !important;
        }
        
        /* Additional text direction fixes */
        .rich-text-editor p, .rich-text-editor div, .rich-text-editor span {
          direction: ltr !important;
          unicode-bidi: embed !important;
          text-align: left !important;
        }
        
        /* Force LTR for all text nodes */
        .rich-text-editor::before, .rich-text-editor::after {
          direction: ltr !important;
        }
        
        /* Prevent browser auto-detection of text direction */
        .rich-text-editor {
          -webkit-locale: "en-US" !important;
          -moz-locale: "en-US" !important;
        }
        
        /* Override any inherited RTL styles */
        .rich-text-editor[dir="rtl"], .rich-text-editor [dir="rtl"] {
          direction: ltr !important;
          text-align: left !important;
        }
      `}</style>
    </div>
  );
}
