import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Tabs, Alert } from 'antd';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-json';
import beautify from 'js-beautify';
import './DryRunResultDialog.css';

const { TabPane } = Tabs;

export interface DryRunResultDialogRef {
  open: (result: DryRunResult) => void;
}

interface DryRunResultDialogProps {}

export interface DryRunResult {
  mappedData?: any;
  entities?: any;
  parseStatistic?: any;
  tracerEvents?: any[];
}

const DryRunResultDialog = forwardRef<DryRunResultDialogRef, DryRunResultDialogProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    const [result, setResult] = useState<DryRunResult | null>(null);
    const [activeTab, setActiveTab] = useState('mappedData');
    const [hasErrors, setHasErrors] = useState(false);

    useImperativeHandle(ref, () => ({
      open: (resultData: DryRunResult) => {
        setResult(resultData);
        setActiveTab('mappedData');
        checkForErrors(resultData);
        setVisible(true);
      },
    }));

    const checkForErrors = (resultData: DryRunResult) => {
      if (resultData.tracerEvents) {
        const errors = resultData.tracerEvents.filter(
          (event: any) => event.level === 'ERROR' || event.level === 'WARN'
        );
        setHasErrors(errors.length > 0);
      } else {
        setHasErrors(false);
      }
    };

    const formatJson = (data: any): string => {
      if (!data) return '';
      try {
        const jsonString = JSON.stringify(data, null, 2);
        return beautify.js(jsonString, { indent_size: 2 });
      } catch (error) {
        return String(data);
      }
    };

    const highlightJson = (json: string): string => {
      try {
        return Prism.highlight(json, Prism.languages.json, 'json');
      } catch (error) {
        return json;
      }
    };

    const handleClose = () => {
      setVisible(false);
      setResult(null);
    };

    if (!result) return null;

    return (
      <Modal
        title="Dry Run Result"
        open={visible}
        onCancel={handleClose}
        width="90%"
        footer={null}
        className="dry-run-result-dialog"
      >
        {hasErrors && (
          <Alert
            message="Errors Detected"
            description="The dry run encountered errors. Please check the Tracer Events tab for details."
            type="error"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Mapped Data" key="mappedData">
            <div className="dry-run-result-content">
              <pre
                className="language-json"
                dangerouslySetInnerHTML={{
                  __html: highlightJson(formatJson(result.mappedData)),
                }}
              />
            </div>
          </TabPane>

          <TabPane tab="Entities" key="entities">
            <div className="dry-run-result-content">
              <pre
                className="language-json"
                dangerouslySetInnerHTML={{
                  __html: highlightJson(formatJson(result.entities)),
                }}
              />
            </div>
          </TabPane>

          <TabPane tab="Parse Statistic" key="parseStatistic">
            <div className="dry-run-result-content">
              <pre
                className="language-json"
                dangerouslySetInnerHTML={{
                  __html: highlightJson(formatJson(result.parseStatistic)),
                }}
              />
            </div>
          </TabPane>

          <TabPane tab="Tracer Events" key="tracerEvents">
            <div className="dry-run-result-content">
              {result.tracerEvents && result.tracerEvents.length > 0 ? (
                <div className="tracer-events-list">
                  {result.tracerEvents.map((event: any, index: number) => (
                    <div
                      key={index}
                      className={`tracer-event tracer-event-${event.level?.toLowerCase()}`}
                    >
                      <div className="tracer-event-header">
                        <span className="tracer-event-level">{event.level}</span>
                        <span className="tracer-event-time">{event.timestamp}</span>
                      </div>
                      <div className="tracer-event-message">{event.message}</div>
                      {event.details && (
                        <pre
                          className="tracer-event-details language-json"
                          dangerouslySetInnerHTML={{
                            __html: highlightJson(formatJson(event.details)),
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No tracer events</div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
);

DryRunResultDialog.displayName = 'DryRunResultDialog';

export default DryRunResultDialog;

