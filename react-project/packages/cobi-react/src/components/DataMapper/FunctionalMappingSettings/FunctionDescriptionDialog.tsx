import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Drawer, Input, Collapse, Empty } from 'antd';
import './FunctionDescriptionDialog.css';

const { Panel } = Collapse;

export interface FunctionDescriptionDialogRef {
  open: () => void;
}

interface FunctionDescriptionDialogProps {
  listAllFunctions?: any[];
  listAllTransformers?: any[];
  isShowFunctions?: boolean;
  isShowTransformers?: boolean;
}

const FunctionDescriptionDialog = forwardRef<FunctionDescriptionDialogRef, FunctionDescriptionDialogProps>(
  ({ listAllFunctions = [], listAllTransformers = [], isShowFunctions = true, isShowTransformers = true }, ref) => {
    const [visible, setVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
      },
    }));

    const filterData = (data: any[]) => {
      if (!searchValue) return data;
      return data.filter((el: any) => {
        const nameMatch = el.name?.toLowerCase().includes(searchValue.toLowerCase());
        const descMatch = el.description?.toLowerCase().includes(searchValue.toLowerCase());
        return nameMatch || descMatch;
      });
    };

    const simpleList = useMemo(() => {
      return filterData(listAllFunctions.filter((el: any) => el.functionClass?.indexOf('.simple.') > -1));
    }, [listAllFunctions, searchValue]);

    const reduceList = useMemo(() => {
      return filterData(listAllFunctions.filter((el: any) => el.functionClass?.indexOf('.reduce.') > -1));
    }, [listAllFunctions, searchValue]);

    const enlargeList = useMemo(() => {
      return filterData(listAllFunctions.filter((el: any) => el.functionClass?.indexOf('.enlarge.') > -1));
    }, [listAllFunctions, searchValue]);

    const transformersBlocklyTypes = useMemo(() => {
      const types = listAllTransformers.map((el: any) => {
        let name = el.inType?.split('.').pop();
        if (name === '[B') name = 'Bytes';
        return name;
      });
      return [...new Set(types)];
    }, [listAllTransformers]);

    const transformersByType = (type: string) => {
      return filterData(
        listAllTransformers.filter((el: any) => {
          let elType = el.inType?.split('.').pop();
          if (elType === '[B') elType = 'Bytes';
          return elType === type;
        })
      );
    };

    const renderFunctionItem = (func: any) => (
      <div key={func.name} className="function-item">
        <h4>{func.name}</h4>
        <p className="description">{func.description}</p>
        {func.functionClass && <p className="class-name">Class: {func.functionClass}</p>}
      </div>
    );

    const renderTransformerItem = (transformer: any) => (
      <div key={transformer.transformerKey} className="transformer-item">
        <h4>{transformer.transformerKey?.split('.').pop()?.replace('$', ' → ')}</h4>
        <p className="description">{transformer.description}</p>
        <p className="type-info">
          {transformer.inType} → {transformer.outType}
        </p>
      </div>
    );

    return (
      <Drawer
        title="Documentation"
        placement="right"
        width="40%"
        open={visible}
        onClose={() => setVisible(false)}
        className="function-description-dialog"
      >
        <div className="search-section">
          <Input
            placeholder="Search by name or description..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
          />
        </div>

        {isShowFunctions && (simpleList.length > 0 || reduceList.length > 0 || enlargeList.length > 0) && (
          <div className="functions-section">
            <h2>Functions</h2>
            <Collapse accordion>
              {simpleList.length > 0 && (
                <Panel header="Simple" key="simple">
                  {simpleList.map(renderFunctionItem)}
                </Panel>
              )}
              {reduceList.length > 0 && (
                <Panel header="Reduce" key="reduce">
                  {reduceList.map(renderFunctionItem)}
                </Panel>
              )}
              {enlargeList.length > 0 && (
                <Panel header="Enlarge" key="enlarge">
                  {enlargeList.map(renderFunctionItem)}
                </Panel>
              )}
            </Collapse>
          </div>
        )}

        {isShowTransformers && transformersBlocklyTypes.length > 0 && (
          <div className="transformers-section">
            <h2>Transformers</h2>
            <Collapse accordion>
              {transformersBlocklyTypes.map((type) => {
                const transformers = transformersByType(type);
                if (transformers.length === 0) return null;
                return (
                  <Panel header={type} key={type}>
                    {transformers.map(renderTransformerItem)}
                  </Panel>
                );
              })}
            </Collapse>
          </div>
        )}

        {!isShowFunctions && !isShowTransformers && <Empty description="No documentation available" />}
      </Drawer>
    );
  }
);

FunctionDescriptionDialog.displayName = 'FunctionDescriptionDialog';

export default FunctionDescriptionDialog;

