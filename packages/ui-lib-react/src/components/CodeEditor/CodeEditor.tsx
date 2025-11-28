import React, { useRef, useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'
import { registerCyodaThemes, CYODA_EDITOR_OPTIONS } from './monacoTheme'
import './CodeEditor.scss'

// Helper to detect current theme
const getCurrentTheme = (): 'light' | 'dark' => {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

// Monaco editor worker setup - skip in test environment
// Check if we're in a test environment (vitest sets process.env.VITEST or import.meta.env.VITEST)
const isTestEnv = typeof process !== 'undefined' && (process.env.VITEST || process.env.NODE_ENV === 'test')

// Track worker setup state
let workersSetupPromise: Promise<void> | null = null

if (!isTestEnv && typeof window !== 'undefined') {
  // Dynamically import workers only in non-test environment
  // This prevents Vite from trying to resolve worker imports during tests
  workersSetupPromise = import('./monacoWorkers').then(({ setupMonacoWorkers }) => {
    setupMonacoWorkers()
  }).catch((error) => {
    console.warn('Failed to load Monaco editor workers:', error)
  })
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
    // Replace escaped newlines with actual newlines
    const stringValue = String(val || '')
    return stringValue.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
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

    const initEditor = async () => {
      // Wait for workers to be set up in production (if needed)
      if (workersSetupPromise) {
        await workersSetupPromise
      }

      // Register both Cyoda themes and set the current one
      const currentTheme = getCurrentTheme()
      registerCyodaThemes(monaco, currentTheme)

      const monacoLanguage = getMonacoLanguage(language)

    if (!diff) {
      // Standard editor
      const editor = monaco.editor.create(containerRef.current, {
        ...CYODA_EDITOR_OPTIONS,
        value: formatValue(value),
        language: monacoLanguage,
        theme: currentTheme === 'light' ? 'cyoda-light' : 'cyoda-dark',
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
      const originalValue = formatValue(oldString || '')
      const modifiedValue = formatValue(newString || '')

      console.log('CodeEditor: Creating diff editor')
      console.log('  originalValue:', originalValue)
      console.log('  modifiedValue:', modifiedValue)
      console.log('  container:', containerRef.current)

      const originalModel = monaco.editor.createModel(originalValue, monacoLanguage)
      const modifiedModel = monaco.editor.createModel(modifiedValue, monacoLanguage)

      const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
        ...CYODA_EDITOR_OPTIONS,
        originalEditable: !diffReadonly,
        theme: currentTheme === 'light' ? 'cyoda-light' : 'cyoda-dark',
        renderOverviewRuler: true,
        renderSideBySide: true,
        enableSplitViewResizing: true,
        readOnly: diffReadonly,
        automaticLayout: true,
        // Diff-specific options
        ignoreTrimWhitespace: false,
        renderIndicators: true,
        diffWordWrap: 'on',
        diffAlgorithm: 'advanced',
      })

      console.log('CodeEditor: Diff editor created:', diffEditor)
      console.log('CodeEditor: Container dimensions:', {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
        clientWidth: containerRef.current.clientWidth,
        clientHeight: containerRef.current.clientHeight
      })

      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel
      })

      console.log('CodeEditor: Models set')

      // Force layout after a short delay to ensure container has dimensions
      setTimeout(() => {
        console.log('CodeEditor: Forcing layout')
        diffEditor.layout()
        // Ensure side-by-side mode is enabled
        diffEditor.updateOptions({ renderSideBySide: true })
        console.log('CodeEditor: Side-by-side mode enforced')
      }, 100)

      // Listen for content changes on modified model
      modifiedModel.onDidChangeContent(() => {
        const newValue = modifiedModel.getValue()
        onChange?.(parseValue(newValue) as string)
      })

      editorRef.current = diffEditor
      setIsInitialized(true)
      onReady?.(diffEditor)
    }
    }

    // Call the async init function
    initEditor()

    return () => {
      editorRef.current?.dispose()
      editorRef.current = null
      setIsInitialized(false)
    }
  }, []) // Only run once on mount

  // Watch for theme changes and update Monaco theme
  useEffect(() => {
    if (!isInitialized) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = getCurrentTheme()
          monaco.editor.setTheme(newTheme === 'light' ? 'cyoda-light' : 'cyoda-dark')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => {
      observer.disconnect()
    }
  }, [isInitialized])

  // Update value when it changes externally
  useEffect(() => {
    console.log('CodeEditor: Update effect triggered', {
      hasEditor: !!editorRef.current,
      isInitialized,
      diff,
      oldString: oldString?.substring(0, 50),
      newString: newString?.substring(0, 50)
    })

    if (!editorRef.current || !isInitialized) {
      console.log('CodeEditor: Skipping update - editor not ready')
      return
    }

    if (!diff && 'setValue' in editorRef.current) {
      const editor = editorRef.current as monaco.editor.IStandaloneCodeEditor
      const currentValue = editor.getValue()
      const newValue = formatValue(value)

      if (currentValue !== newValue) {
        console.log('CodeEditor: Updating standard editor value')
        editor.setValue(newValue)
      }
    } else if (diff && 'getModel' in editorRef.current) {
      // Update diff editor models
      const diffEditor = editorRef.current as monaco.editor.IStandaloneDiffEditor
      const model = diffEditor.getModel()

      console.log('CodeEditor: Updating diff editor', { hasModel: !!model })

      if (model) {
        console.log('CodeEditor: Raw diff input', {
          oldString: oldString?.substring(0, 200),
          newString: newString?.substring(0, 200),
          areEqual: oldString === newString
        })

        const originalValue = formatValue(oldString || '')
        const modifiedValue = formatValue(newString || '')

        console.log('CodeEditor: Formatted diff values', {
          originalValue: originalValue,
          modifiedValue: modifiedValue,
          originalLength: originalValue.length,
          modifiedLength: modifiedValue.length,
          currentOriginalLength: model.original.getValue().length,
          currentModifiedLength: model.modified.getValue().length,
          areEqual: originalValue === modifiedValue
        })

        // Always update models to ensure diff is recalculated
        console.log('CodeEditor: Setting original value')
        model.original.setValue(originalValue)
        console.log('CodeEditor: Setting modified value')
        model.modified.setValue(modifiedValue)

        // Force layout update to ensure diff is computed and displayed
        setTimeout(() => {
          if (editorRef.current && 'updateOptions' in editorRef.current) {
            const diffEditor = editorRef.current as monaco.editor.IStandaloneDiffEditor
            const lineChanges = diffEditor.getLineChanges()
            const currentModel = diffEditor.getModel()

            console.log('CodeEditor: Detailed diff state:', {
              lineChangesCount: lineChanges?.length || 0,
              lineChanges: lineChanges,
              originalValue: currentModel?.original.getValue().substring(0, 200),
              modifiedValue: currentModel?.modified.getValue().substring(0, 200)
            })

            // Force re-render
            diffEditor.updateOptions({})
            diffEditor.layout()
            console.log('CodeEditor: Forced diff editor layout update and re-render')
          }
        }, 100)
      }
    }
  }, [value, oldString, newString, isInitialized, diff])

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

