import React, { useState, useEffect } from 'react';
import { Collapse } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import type { Script } from '../../../types';
import { useScriptsApi } from '../../../hooks/useScripts';
import './ScriptEditorUsedScripts.css';

const { Panel } = Collapse;

interface ScriptEditorUsedScriptsProps {
  script?: Script;
  onScriptErrors?: (errors: string[]) => void;
}

const ScriptEditorUsedScripts: React.FC<ScriptEditorUsedScriptsProps> = ({
  script,
  onScriptErrors,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [allUsedVersions, setAllUsedVersions] = useState<any[]>([]);
  const [reusableScriptsErrors, setReusableScriptsErrors] = useState<string[]>([]);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (script?.reusableScripts && script.reusableScripts.length > 0) {
      loadScriptData();
    } else {
      setAllUsedVersions([]);
      setReusableScriptsErrors([]);
      setCode('');
    }
  }, [script?.reusableScripts]);

  useEffect(() => {
    // Generate combined code from all used versions
    let codeTxt = '';
    allUsedVersions.forEach((el) => {
      codeTxt += `// Script name: "${el.scriptName}" | Version: ${el.scriptVersion}\n`;
      codeTxt += `${el.script}\n`;
      codeTxt += `\n// --------------\n\n`;
    });
    setCode(codeTxt);
  }, [allUsedVersions]);

  useEffect(() => {
    onScriptErrors?.(reusableScriptsErrors);
  }, [reusableScriptsErrors]);

  const loadScriptData = async () => {
    if (!script?.reusableScripts) return;

    const usedVersions: any[] = [];
    const errors: string[] = [];

    // Load each reusable script
    for (const scriptId of script.reusableScripts) {
      try {
        // TODO: Implement actual API call to get script version
        // const response = await getScriptVersion(scriptId);
        // usedVersions.push(response.data);
        
        // For now, add placeholder
        usedVersions.push({
          scriptName: `Script ${scriptId}`,
          scriptVersion: '1.0.0',
          script: '// Script content placeholder',
        });
      } catch (error) {
        errors.push(scriptId);
      }
    }

    setAllUsedVersions(usedVersions);
    setReusableScriptsErrors(errors);
  };

  if (!script?.reusableScripts || script.reusableScripts.length === 0) {
    return null;
  }

  return (
    <div className={`script-editor-used-scripts ${!isCollapsed ? 'expanded' : ''}`}>
      <div
        className="script-editor-used-scripts-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div>Reusable code: {isCollapsed ? 'Expand' : 'Collapse'}</div>
        <div>
          <DownOutlined rotate={isCollapsed ? 0 : 180} />
        </div>
      </div>

      {!isCollapsed && (
        <div className="script-editor-used-scripts-body">
          <Editor
            height="200px"
            defaultLanguage="javascript"
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ScriptEditorUsedScripts;

