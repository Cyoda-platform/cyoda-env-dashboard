import React, { useEffect } from 'react';
import './ActiveRelationInformation.css';

interface ActiveRelationInformationProps {
  isActive: boolean;
  onCancel: () => void;
}

const ActiveRelationInformation: React.FC<ActiveRelationInformationProps> = ({
  isActive,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      const isEscape = evt.key === 'Escape' || evt.key === 'Esc' || evt.keyCode === 27;
      if (isEscape && isActive) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onCancel]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="active-relation-information">
      <div>
        Press <span className="esc">ESC</span> to cancel mapping
      </div>
    </div>
  );
};

export default ActiveRelationInformation;

