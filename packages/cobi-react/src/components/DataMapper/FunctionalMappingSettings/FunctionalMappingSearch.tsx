import React, { useMemo } from 'react';
import { Cascader } from 'antd';
import type { CascaderProps } from 'antd';
import HelperFunctionalMapping from '../../../utils/functionalMappingHelper';
import './FunctionalMappingSearch.css';

interface FunctionalMappingSearchProps {
  listAllFunctions: any[];
  listAllTransformers: any[];
  onChange: (value: any) => void;
}

interface CascaderOption {
  value: string | any;
  label: string;
  description?: string;
  children?: CascaderOption[];
}

const FunctionalMappingSearch: React.FC<FunctionalMappingSearchProps> = ({
  listAllFunctions,
  listAllTransformers,
  onChange,
}) => {
  const functionOptions = useMemo(() => {
    const datas: any = HelperFunctionalMapping.getFunctions(listAllFunctions);
    return Object.keys(datas).map((key) => ({
      label: key,
      value: key,
      children: datas[key].map((el: any) => ({
        value: HelperFunctionalMapping.getFunctionName(el),
        label: el.name,
        description: el.description,
      })),
    }));
  }, [listAllFunctions]);

  const transformersOptions = useMemo(() => {
    const datas: any = HelperFunctionalMapping.getTransformers(listAllTransformers);
    return Object.keys(datas).map((key) => ({
      label: key,
      value: key,
      children: datas[key].map((el: any) => {
        const title = el.transformerKey.split('.').pop().replace('$', ' ').split(' ').join(' -> ');
        return {
          value: {
            name: HelperFunctionalMapping.getTransformerName(el),
            transformerKey: el.transformerKey,
          },
          label: title,
          description: el.description,
        };
      }),
    }));
  }, [listAllTransformers]);

  const options: CascaderOption[] = useMemo(() => [
    {
      label: 'Statements',
      value: 'statements',
      children: HelperFunctionalMapping.getStatements().map((el) => ({
        value: el.value,
        label: el.name,
      })),
    },
    {
      label: 'Expressions',
      value: 'expressions',
      children: HelperFunctionalMapping.getExpressions().map((el) => ({
        value: el.value,
        label: el.name,
      })),
    },
    {
      label: 'Functions',
      value: 'functions',
      children: functionOptions,
    },
    {
      label: 'Transformers',
      value: 'transformers',
      children: transformersOptions,
    },
  ], [functionOptions, transformersOptions]);

  const filter: CascaderProps<CascaderOption>['showSearch'] = (inputValue, path) => {
    return path.some((option) => {
      const labelMatch = option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
      const descriptionMatch = option.description && 
        option.description.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
      return labelMatch || descriptionMatch;
    });
  };

  const displayRender = (labels: string[]) => labels.join(' / ');

  return (
    <Cascader
      className="functional-mapping-search"
      options={options}
      onChange={onChange}
      placeholder="Search blocks..."
      showSearch={{ filter }}
      displayRender={displayRender}
      style={{ width: 300 }}
      classNames={{ popup: { root: 'functional-mapping-search-popup' } }}
    />
  );
};

export default FunctionalMappingSearch;

