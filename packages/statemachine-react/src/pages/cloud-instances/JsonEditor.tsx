import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

export interface JsonEditorProps {
  value: unknown;
  /** When omitted, editor is read-only. */
  onChange?: (next: { text: string; parsed: unknown | undefined; valid: boolean }) => void;
  height?: number | string;
  /** Reset editor content when this changes (e.g. after a successful PUT reloads the entity). */
  resetKey?: string | number;
}

const stringify = (value: unknown): string => {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value ?? '');
  }
};

const getCurrentTheme = (): 'vs-dark' | 'light' =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'vs-dark';

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, height = 480, resetKey }) => {
  const initial = useMemo(() => stringify(value), [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>(getCurrentTheme);

  useEffect(() => {
    if (editorRef.current) editorRef.current.setValue(stringify(value));
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: 'error',
    });
  };

  const handleChange = (text: string | undefined) => {
    if (!onChange) return;
    const t = text ?? '';
    let parsed: unknown | undefined;
    let valid = true;
    try {
      parsed = JSON.parse(t);
    } catch {
      valid = false;
    }
    onChange({ text: t, parsed, valid });
  };

  return (
    <Editor
      height={height}
      defaultLanguage="json"
      defaultValue={initial}
      theme={theme}
      onMount={handleMount}
      onChange={handleChange}
      options={{
        readOnly: !onChange,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        formatOnPaste: true,
        wordWrap: 'on',
        tabSize: 2,
        fontSize: 13,
        renderWhitespace: 'none',
      }}
    />
  );
};
