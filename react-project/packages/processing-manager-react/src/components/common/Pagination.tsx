/**
 * Pagination Component
 * Migrated from @cyoda/processing-manager/src/components/Pagination/Pagination.vue
 */

import React, { useState } from 'react';
import { Button, Select, Space } from 'antd';
import {
  DoubleLeftOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';
import './Pagination.scss';

interface PaginationForm {
  pageSize: number;
  requestLast: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

interface PaginationProps {
  firstPage?: boolean;
  lastPage?: boolean;
  nextCursor?: string;
  prevCursor?: string;
  onChange?: (form: PaginationForm) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  firstPage = false,
  lastPage = false,
  nextCursor = '',
  prevCursor = '',
  onChange,
}) => {
  const [form, setForm] = useState<PaginationForm>({
    pageSize: 25,
    requestLast: false,
    nextCursor: null,
    prevCursor: null,
  });

  const pagesOptions = [10, 25, 50, 100, 200, 500];

  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      requestLast: false,
      nextCursor: null,
      prevCursor: null,
    }));
  };

  const onClickFirst = () => {
    const newForm = { ...form, requestLast: false, nextCursor: null, prevCursor: null };
    setForm(newForm);
    onChange?.(newForm);
  };

  const onClickPrev = () => {
    const newForm = { ...form, prevCursor, nextCursor: null, requestLast: false };
    setForm(newForm);
    onChange?.(newForm);
  };

  const onClickNext = () => {
    const newForm = { ...form, nextCursor, prevCursor: null, requestLast: false };
    setForm(newForm);
    onChange?.(newForm);
  };

  const onClickLast = () => {
    const newForm = { ...form, requestLast: true, nextCursor: null, prevCursor: null };
    setForm(newForm);
    onChange?.(newForm);
  };

  const pageSizeChange = (value: number) => {
    const newForm = { ...form, pageSize: value };
    setForm(newForm);
    onChange?.(newForm);
  };

  return (
    <div className="pagination">
      <div className="row">
        <Space>
          {!firstPage && (
            <>
              <Button type="primary" onClick={onClickFirst} icon={<DoubleLeftOutlined />}>
                First
              </Button>
              <Button type="primary" onClick={onClickPrev} icon={<LeftOutlined />}>
                Prev
              </Button>
            </>
          )}
          {!lastPage && (
            <>
              <Button type="primary" onClick={onClickNext}>
                Next <RightOutlined />
              </Button>
              <Button type="primary" onClick={onClickLast}>
                Last <DoubleRightOutlined />
              </Button>
            </>
          )}
          <Select
            className="page-size"
            value={form.pageSize}
            onChange={pageSizeChange}
            placeholder="Page Size"
            options={pagesOptions.map((page) => ({
              value: page,
              label: `${page}/page`,
            }))}
          />
        </Space>
      </div>
    </div>
  );
};

export default Pagination;

