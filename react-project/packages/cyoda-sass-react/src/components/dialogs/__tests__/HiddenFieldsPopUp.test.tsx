import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HiddenFieldsPopUp from '../HiddenFieldsPopUp';
import type { SqlField } from '../../../types';

describe('HiddenFieldsPopUp', () => {
  const mockFields: SqlField[] = [
    {
      fieldName: 'visible_field',
      fieldType: 'varchar',
      hidden: false,
    },
    {
      fieldName: 'hidden_field',
      fieldType: 'integer',
      hidden: true,
    },
  ];

  it('should render without crashing', () => {
    const ref = { current: null };
    const { container } = render(<HiddenFieldsPopUp ref={ref} />);
    expect(container).toBeTruthy();
  });

  it('should not display dialog initially', () => {
    const ref = { current: null };
    render(<HiddenFieldsPopUp ref={ref} />);
    
    // Dialog should not be visible initially
    expect(screen.queryByText('Hidden Fields')).not.toBeInTheDocument();
  });

  it('should expose open method via ref', () => {
    const ref = { current: null } as any;
    render(<HiddenFieldsPopUp ref={ref} />);
    
    expect(ref.current).toBeTruthy();
    expect(typeof ref.current?.open).toBe('function');
  });

  it('should accept fields parameter in open method', () => {
    const ref = { current: null } as any;
    render(<HiddenFieldsPopUp ref={ref} />);
    
    // Should be able to call open with fields
    if (ref.current?.open) {
      expect(() => ref.current.open(mockFields)).not.toThrow();
    }
  });
});

