import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import RawDataDialog from '../RawDataDialog';

describe('RawDataDialog', () => {
  const mockFileDatas = {
    json: '{"name":"John","age":30}',
    xml: '<root><name>John</name></root>',
  };

  it('should render dialog when opened with JSON', () => {
    const ref = React.createRef<any>();
    render(
      <RawDataDialog
        ref={ref}
        fileDatas={mockFileDatas}
        fileType="json"
      />
    );

    ref.current?.open();

    expect(screen.getByText('Raw Data')).toBeInTheDocument();
  });

  it('should render dialog when opened with XML', () => {
    const ref = React.createRef<any>();
    render(
      <RawDataDialog
        ref={ref}
        fileDatas={mockFileDatas}
        fileType="xml"
      />
    );

    ref.current?.open();

    expect(screen.getByText('Raw Data')).toBeInTheDocument();
  });

  it('should have close button', () => {
    const ref = React.createRef<any>();
    render(
      <RawDataDialog
        ref={ref}
        fileDatas={mockFileDatas}
        fileType="json"
      />
    );

    ref.current?.open();

    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});

