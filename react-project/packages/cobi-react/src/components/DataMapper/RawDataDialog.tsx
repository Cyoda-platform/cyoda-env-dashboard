import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { Modal, Button } from 'antd';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import beautify from 'js-beautify';
import './RawDataDialog.css';

interface RawDataDialogProps {
  fileDatas: {
    json?: string;
    xml?: string;
    csv?: string;
  };
  fileType: 'json' | 'xml' | 'csv';
}

export interface RawDataDialogRef {
  open: () => void;
  close: () => void;
}

const RawDataDialog = forwardRef<RawDataDialogRef, RawDataDialogProps>(
  ({ fileDatas, fileType }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const codeObj = useMemo(() => {
      const rawData = fileDatas[fileType];
      if (!rawData) {
        return {
          class: 'language-javascript',
          code: '',
        };
      }

      const trimmedData = rawData.trim();

      if (fileType === 'json') {
        try {
          // Beautify JSON
          const beautified = beautify.js(trimmedData, {
            indent_size: 2,
            space_in_empty_paren: true,
            wrap_line_length: 50,
          });

          return {
            class: 'language-javascript',
            code: Prism.highlight(beautified, Prism.languages.javascript, 'javascript'),
          };
        } catch (error) {
          console.error('Error beautifying JSON:', error);
          return {
            class: 'language-javascript',
            code: Prism.highlight(trimmedData, Prism.languages.javascript, 'javascript'),
          };
        }
      } else if (fileType === 'xml') {
        return {
          class: 'language-markup',
          code: Prism.highlight(trimmedData, Prism.languages.markup, 'markup'),
        };
      } else {
        // CSV or other
        return {
          class: 'language-markup',
          code: Prism.highlight(trimmedData, Prism.languages.markup, 'markup'),
        };
      }
    }, [fileDatas, fileType]);

    return (
      <Modal
        title="Raw Data"
        open={visible}
        onCancel={() => setVisible(false)}
        width="90%"
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
      >
        <pre className={codeObj.class}>
          <code
            className={codeObj.class}
            dangerouslySetInnerHTML={{ __html: codeObj.code }}
          />
        </pre>
      </Modal>
    );
  }
);

RawDataDialog.displayName = 'RawDataDialog';

export default RawDataDialog;

