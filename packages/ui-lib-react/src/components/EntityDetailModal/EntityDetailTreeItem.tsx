/**
 * EntityDetailTreeItem Component
 * Renders a single entity field with support for different types (LEAF, EMBEDDED, LIST, MAP)
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/AdaptableBlotter/AdaptableBlotterEntity/DetailTreeItem.vue
 */

import React, { useState, useEffect } from 'react';
import { Collapse, Select, Spin } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { Entity } from '@cyoda/http-api-react/types';
import { HelperFormat } from '../../utils/HelperFormat';
import { getEntityLoad } from '@cyoda/http-api-react';
import HelperDetailEntity from '../../utils/HelperDetailEntity';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import './EntityDetailTreeItem.scss';

interface EntityDetailTreeItemProps {
  column: Entity;
  showEmpty: boolean;
  entityId?: string;
  entityClass?: string;
}

const EntityDetailTreeItem: React.FC<EntityDetailTreeItemProps> = ({
  column,
  showEmpty,
  entityId,
  entityClass,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [nestedEntity, setNestedEntity] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);

  // Get field name
  const name = column.columnInfo?.columnName || column.columnInfo?.columnPath || 'Unknown';

  // Check if value is short (should be displayed inline)
  const isShortValue = HelperFormat.isShortDetailTreeItem(column.value);

  // Format value for display
  const formatValue = (value: any): string => {
    return HelperFormat.getValue(value);
  };

  // Check if value is XML
  const isXml = (value: any): boolean => {
    return typeof value === 'string' && HelperFormat.isXml(value);
  };

  // Check if value is JSON
  const isJson = (value: any): boolean => {
    return typeof value === 'string' && HelperFormat.isJson(value);
  };

  // Load nested data for LIST type
  const loadNestedData = async (optionIndex: number) => {
    if (!entityId || !entityClass) return;

    const columnPath = `${column.columnInfo.columnPath}.[${optionIndex}]`;
    setLoading(true);

    try {
      const { data } = await getEntityLoad(entityId, entityClass, '', columnPath);
      const filteredData = HelperDetailEntity.filterData(data);
      setNestedEntity(filteredData);
    } catch (error) {
      console.error('Failed to load nested data:', error);
      setNestedEntity([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle option change for LIST type
  const handleOptionChange = (value: number) => {
    setSelectedOption(value);
    loadNestedData(value);
  };

  // Render LEAF type with short value (inline)
  if (column.type === 'LEAF' && isShortValue) {
    return (
      <div className="detail-tree-item-inline">
        <span className="field-name">{name}:</span>
        <span className="field-value">{formatValue(column.value)}</span>
      </div>
    );
  }

  // Render LEAF type with long value (expandable)
  if (column.type === 'LEAF') {
    const value = column.value;
    let codeHighlight = null;

    if (isXml(value)) {
      codeHighlight = {
        class: 'language-xml',
        code: Prism.highlight(value, Prism.languages.xml, 'xml'),
      };
    } else if (isJson(value)) {
      codeHighlight = {
        class: 'language-javascript',
        code: Prism.highlight(value, Prism.languages.javascript, 'javascript'),
      };
    }

    return (
      <div className="detail-tree-item-expandable">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
          className="detail-tree-collapse"
        >
          <Collapse.Panel header={name} key="leaf">
            {codeHighlight ? (
              <pre className={codeHighlight.class}>
                <code className={codeHighlight.class} dangerouslySetInnerHTML={{ __html: codeHighlight.code }} />
              </pre>
            ) : (
              <div className="field-value-text">{formatValue(value)}</div>
            )}
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  // Render LIST type (with option selector)
  if (column.type === 'LIST') {
    const listSize = (column as any).listSize || 0;
    const options = Array.from({ length: listSize }, (_, i) => ({
      label: `Option ${i + 1}`,
      value: i,
    }));

    return (
      <div className="detail-tree-item-expandable">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
          className="detail-tree-collapse"
        >
          <Collapse.Panel header={name} key="list">
            <div className="list-content">
              <Select
                value={selectedOption}
                onChange={handleOptionChange}
                options={options}
                style={{ width: '100%', marginBottom: 10 }}
                placeholder="Select"
                popupMatchSelectWidth={false}
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
              />
              {loading ? (
                <Spin />
              ) : nestedEntity.length > 0 ? (
                <div className="nested-tree">
                  {nestedEntity.map((field, index) => (
                    <EntityDetailTreeItem
                      key={index}
                      column={field}
                      showEmpty={showEmpty}
                      entityId={entityId}
                      entityClass={entityClass}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  // Render EMBEDDED type (load nested data from server)
  if (column.type === 'EMBEDDED') {
    // Load embedded data on mount
    useEffect(() => {
      const loadEmbeddedData = async () => {
        if (!entityId || !entityClass || isExpanded) return;

        setIsExpanded(true);
        setLoading(true);

        try {
          const realClass = (column as any).realClass || '';
          const columnPath = column.columnInfo.columnPath;
          const { data } = await getEntityLoad(entityId, entityClass, realClass, columnPath);
          const filteredData = HelperDetailEntity.filterData(data);
          setNestedEntity(filteredData);
        } catch (error) {
          console.error('Failed to load embedded data:', error);
          setNestedEntity([]);
        } finally {
          setLoading(false);
        }
      };

      loadEmbeddedData();
    }, []);

    return (
      <div className="detail-tree-item-expandable">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
          className="detail-tree-collapse"
        >
          <Collapse.Panel header={name} key="embedded">
            {loading ? (
              <Spin />
            ) : nestedEntity.length > 0 ? (
              <div className="nested-tree">
                {nestedEntity.map((field, index) => (
                  <EntityDetailTreeItem
                    key={index}
                    column={field}
                    showEmpty={showEmpty}
                    entityId={entityId}
                    entityClass={entityClass}
                  />
                ))}
              </div>
            ) : null}
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  // Render MAP type (with key selector)
  if (column.type === 'MAP') {
    const mapKeys = (column as any).mapKeys || [];
    const options = mapKeys.map((key: string) => ({
      label: key,
      value: key,
    }));

    const handleMapKeyChange = async (value: string) => {
      setSelectedOption(value as any);
      setLoading(true);

      try {
        const columnPath = `${column.columnInfo.columnPath}.[${value}]`;
        const { data } = await getEntityLoad(entityId!, entityClass!, '', columnPath);
        const filteredData = HelperDetailEntity.filterData(data);
        setNestedEntity(filteredData);
      } catch (error) {
        console.error('Failed to load map data:', error);
        setNestedEntity([]);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="detail-tree-item-expandable">
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} />}
          className="detail-tree-collapse"
        >
          <Collapse.Panel header={name} key="map">
            <div className="list-content">
              <Select
                value={selectedOption as any}
                onChange={handleMapKeyChange}
                options={options}
                style={{ width: '100%', marginBottom: 10 }}
                placeholder="Select key"
                popupMatchSelectWidth={false}
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
              />
              {loading ? (
                <Spin />
              ) : nestedEntity.length > 0 ? (
                <div className="nested-tree">
                  {nestedEntity.map((field, index) => (
                    <EntityDetailTreeItem
                      key={index}
                      column={field}
                      showEmpty={showEmpty}
                      entityId={entityId}
                      entityClass={entityClass}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="detail-tree-item-inline">
      <span className="field-name">{name}:</span>
      <span className="field-value">{formatValue(column.value)}</span>
    </div>
  );
};

export default EntityDetailTreeItem;

