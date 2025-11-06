import React, { useState, useEffect } from 'react';
import { Tree, Button, Empty, Tooltip, message, Modal, Input, Form } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  CodeOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { Script } from '../../../types';
import { useScriptsApi } from '../../../hooks/useScripts';
import './ScriptEditorFiles.css';

interface ScriptEditorFilesProps {
  script?: Script;
  onScriptsData?: (data: any) => void;
}

const ScriptEditorFiles: React.FC<ScriptEditorFilesProps> = ({ script, onScriptsData }) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: scriptsData, refetch, isLoading } = useScriptsApi.useListAll({});

  useEffect(() => {
    if (scriptsData) {
      buildTreeData(scriptsData);
      onScriptsData?.(scriptsData);
    }
  }, [scriptsData]);

  const buildTreeData = (data: any) => {
    if (!data?.scripts) {
      setTreeData([]);
      return;
    }

    const tree: DataNode[] = [];
    const scriptMap = new Map<string, DataNode>();

    data.scripts.forEach((scriptItem: any) => {
      const parts = scriptItem.name.split('.');
      let currentPath = '';

      parts.forEach((part: string, index: number) => {
        const previousPath = currentPath;
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        const isLastPart = index === parts.length - 1;

        if (!scriptMap.has(currentPath)) {
          const node: DataNode = {
            key: currentPath,
            title: part,
            icon: isLastPart ? <FileOutlined /> : <FolderOutlined />,
            children: isLastPart ? undefined : [],
            isLeaf: isLastPart,
          };

          scriptMap.set(currentPath, node);

          if (previousPath) {
            const parentNode = scriptMap.get(previousPath);
            if (parentNode && parentNode.children) {
              parentNode.children.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      });
    });

    setTreeData(tree);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      message.success('Scripts refreshed');
    } catch (error) {
      message.error('Failed to refresh scripts');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateScript = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      // TODO: Implement script creation API call
      message.success('Script created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const switcherIcon = (obj: any) => {
    if (obj.isLeaf) {
      return <CodeOutlined />;
    }
    return obj.expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
  };

  return (
    <div className="script-editor-files">
      <div className="script-editor-files-header">
        <h3>Reusable Scripts</h3>
        <div className="script-editor-files-actions">
          <Tooltip title="Create new script">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleCreateScript}
            />
          </Tooltip>
          <Tooltip title="Refresh scripts cache">
            <Button
              type="default"
              size="small"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={handleRefresh}
              loading={isRefreshing}
            />
          </Tooltip>
        </div>
      </div>

      {treeData.length === 0 ? (
        <Empty description="No scripts yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Tree
          showIcon
          switcherIcon={switcherIcon}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          height={300}
        />
      )}

      <Modal
        title="Create New Script"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Script Name"
            rules={[{ required: true, message: 'Please enter script name' }]}
          >
            <Input placeholder="e.g., utils.helpers.formatDate" />
          </Form.Item>
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: 'Please enter version' }]}
          >
            <Input placeholder="e.g., 1.0.0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScriptEditorFiles;

