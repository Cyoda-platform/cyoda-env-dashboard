import React, { useRef, useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'
import { registerCyodaDarkTheme, CYODA_EDITOR_OPTIONS } from './monacoTheme'
import './CodeEditor.scss'

// Monaco editor worker setup
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url))
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url))
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url))
  }
}

export type CodeLanguage = 'javascript' | 'typescript' | 'json' | 'xml' | 'html' | 'css' | 'plain'

export interface CodeEditorAction {
  id: string
  label: string
  keybindings?: number[]
  run: (editor: monaco.editor.IStandaloneCodeEditor) => void
}

export interface CodeEditorProps {
  /** Current value of the editor */
  value?: string
  /** Callback when value changes */
  onChange?: (value: string) => void
  /** Programming language for syntax highlighting */
  language?: CodeLanguage
  /** Whether the editor is read-only */
  readOnly?: boolean
  /** Height of the editor */
  height?: string | number
  /** Whether to show diff view */
  diff?: boolean
  /** Original string for diff view */
  oldString?: string
  /** New string for diff view */
  newString?: string
  /** Whether diff editor is read-only */
  diffReadonly?: boolean
  /** Whether to treat value as JSON object */
  isObject?: boolean
  /** Custom actions to add to the editor */
  actions?: CodeEditorAction[]
  /** Callback when editor is ready */
  onReady?: (editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor) => void
}

/**
 * CodeEditor Component
 * Monaco-based code editor with syntax highlighting and diff support
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/CyodaEditor/CyodaEditor.vue
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value = '',
  onChange,
  language = 'plain',
  readOnly = false,
  height = '400px',
  diff = false,
  oldString = '',
  newString = '',
  diffReadonly = true,
  isObject = false,
  actions = [],
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Convert language to Monaco format
  const getMonacoLanguage = (lang: CodeLanguage): string => {
    if (lang === 'plain') return 'plaintext'
    if (lang === 'javascript') return 'javascript'
    return lang
  }

  // Format JSON if needed
  const formatValue = (val: string | object): string => {
    if (isObject && typeof val === 'object') {
      return JSON.stringify(val, null, 2)
    }
    return String(val || '')
  }

  // Parse JSON if needed
  const parseValue = (val: string): string | object => {
    if (isObject) {
      try {
        return JSON.parse(val)
      } catch (e) {
        return val
      }
    }
    return val
  }

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current || isInitialized) return

    // Register the Cyoda Dark theme
    registerCyodaDarkTheme(monaco)

    const monacoLanguage = getMonacoLanguage(language)

    if (!diff) {
      // Standard editor
      const editor = monaco.editor.create(containerRef.current, {
        ...CYODA_EDITOR_OPTIONS,
        value: formatValue(value),
        language: monacoLanguage,
        theme: 'cyoda-dark',
        readOnly,
      })

      // Listen for content changes
      editor.getModel()?.onDidChangeContent(() => {
        const newValue = editor.getValue()
        onChange?.(parseValue(newValue) as string)
      })

      // Add custom actions
      actions.forEach(action => {
        editor.addAction({
          id: action.id,
          label: action.label,
          keybindings: action.keybindings,
          run: () => action.run(editor)
        })
      })

      editorRef.current = editor
      onReady?.(editor)
    } else {
      // Diff editor
      const originalModel = monaco.editor.createModel(oldString, monacoLanguage)
      const modifiedModel = monaco.editor.createModel(newString, monacoLanguage)

      const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
        ...CYODA_EDITOR_OPTIONS,
        originalEditable: !diffReadonly,
        theme: 'cyoda-dark',
        renderOverviewRuler: false,
      })

      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel
      })

      // Listen for content changes on modified model
      modifiedModel.onDidChangeContent(() => {
        const newValue = modifiedModel.getValue()
        onChange?.(parseValue(newValue) as string)
      })

      editorRef.current = diffEditor
      onReady?.(diffEditor)
    }

    setIsInitialized(true)

    return () => {
      editorRef.current?.dispose()
    }
  }, []) // Only run once on mount

  // Update value when it changes externally
  useEffect(() => {
    if (!editorRef.current || !isInitialized) return

    if (!diff && 'setValue' in editorRef.current) {
      const editor = editorRef.current as monaco.editor.IStandaloneCodeEditor
      const currentValue = editor.getValue()
      const newValue = formatValue(value)
      
      if (currentValue !== newValue) {
        editor.setValue(newValue)
      }
    }
  }, [value, isInitialized, diff])

  // Update language when it changes
  useEffect(() => {
    if (!editorRef.current || !isInitialized || diff) return

    const editor = editorRef.current as monaco.editor.IStandaloneCodeEditor
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, getMonacoLanguage(language))
    }
  }, [language, isInitialized, diff])

  const heightStyle = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      ref={containerRef}
      className={`code-editor ${readOnly ? 'code-editor-readonly' : ''}`}
      style={{ height: heightStyle, width: '100%' }}
    />
  )
}

