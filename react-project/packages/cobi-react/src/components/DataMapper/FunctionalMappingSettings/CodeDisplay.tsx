import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import './CodeDisplay.css';

interface CodeDisplayProps {
  code: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`code-display ${!isCollapsed ? 'is-not-collapsed' : ''}`}>
      <div className="code-display-header" onClick={handleToggleCollapse}>
        <div>{isCollapsed ? 'Expand' : 'Collapse'} code</div>
        <div>
          <DownOutlined />
        </div>
      </div>
      {!isCollapsed && (
        <div className="code-display-body">
          <pre>{code}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeDisplay;

