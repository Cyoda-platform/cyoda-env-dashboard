/**
 * EntityViewer Component Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EntityViewer } from './EntityViewer';
import { useEntityViewerStore } from '../../stores/entityViewerStore';
import * as entitiesApi from '../../api/entities';
import type { EntityViewerEntity } from '../../types';

// Mock dependencies
vi.mock('../../stores/entityViewerStore');
vi.mock('../../api/entities');
vi.mock('@cyoda/tableau-react', () => ({
  ModellingGroup: ({ reportInfoRows }: any) => (
    <div data-testid="modelling-group">
      {reportInfoRows.map((row: any, idx: number) => (
        <div key={idx}>{row.columnName}</div>
      ))}
    </div>
  ),
}));

describe('EntityViewer', () => {
  const mockEntity: EntityViewerEntity = {
    from: '',
    to: 'com.cyoda.core.Entity',
  };

  const mockReportingInfo = [
    { columnName: 'id', columnPath: 'id', columnType: 'STRING', elementType: 'STRING' },
    { columnName: 'name', columnPath: 'name', columnType: 'STRING', elementType: 'STRING' },
    { columnName: 'age', columnPath: 'age', columnType: 'INTEGER', elementType: 'INTEGER' },
  ];

  const mockRelatedPaths = [
    { columnPath: 'user.profile', decision: 'JOIN', targetEntityClass: 'com.example.Profile' },
    { columnPath: 'user.settings', decision: 'JOIN', targetEntityClass: 'com.example.Settings' },
  ];

  const mockRemoveEntity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Clean up DOM
    document.body.innerHTML = '';

    // Mock store
    (useEntityViewerStore as any).mockReturnValue({
      removeEntity: mockRemoveEntity,
    });

    // Mock API calls
    vi.spyOn(entitiesApi, 'getReportingInfo').mockResolvedValue({
      data: mockReportingInfo,
    } as any);

    vi.spyOn(entitiesApi, 'getReportingRelatedPaths').mockResolvedValue({
      data: mockRelatedPaths,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('should render entity viewer with loading state', () => {
      render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    it('should display short name of entity', () => {
      render(
        <EntityViewer
          requestClass="com.cyoda.core.User"
          entity={mockEntity}
        />
      );

      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
          className="custom-class"
        />
      );

      const entityViewer = container.querySelector('.entity-viewer');
      expect(entityViewer).toHaveClass('custom-class');
    });

    it('should apply data attributes', () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
          dataInfo="test-info"
          dataName="test-name"
        />
      );

      const entityViewer = container.querySelector('.entity-viewer');
      expect(entityViewer).toHaveAttribute('data-info', 'test-info');
      expect(entityViewer).toHaveAttribute('data-name', 'test-name');
    });
  });

  describe('Data Loading', () => {
    it('should load entity data on mount', async () => {
      render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      await waitFor(() => {
        expect(entitiesApi.getReportingInfo).toHaveBeenCalledWith(
          'com.cyoda.core.Entity',
          '',
          '',
          false
        );
      });

      await waitFor(() => {
        expect(entitiesApi.getReportingRelatedPaths).toHaveBeenCalledWith(
          'com.cyoda.core.Entity'
        );
      });
    });

    it('should not load data if requestClass is empty', async () => {
      render(
        <EntityViewer
          requestClass=""
          entity={mockEntity}
        />
      );

      await waitFor(() => {
        expect(entitiesApi.getReportingInfo).not.toHaveBeenCalled();
      });
    });

    it('should call onLoaded callback after data loads', async () => {
      const onLoaded = vi.fn();

      render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
          onLoaded={onLoaded}
        />
      );

      await waitFor(() => {
        expect(onLoaded).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(entitiesApi, 'getReportingInfo').mockRejectedValue(new Error('API Error'));

      render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to load entity:', expect.any(Error));
      });

      consoleError.mockRestore();
    });

    it('should display ModellingGroup with loaded data', async () => {
      render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('modelling-group')).toBeInTheDocument();
      });

      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete icon', () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      const deleteIcon = container.querySelector('.wrap-icon');
      expect(deleteIcon).toBeInTheDocument();
    });

    it('should show confirmation modal on delete click', async () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      const deleteIcon = container.querySelector('.wrap-icon svg') as HTMLElement;
      fireEvent.click(deleteIcon);

      await waitFor(() => {
        expect(screen.getAllByText('Confirm')[0]).toBeInTheDocument();
        expect(screen.getByText('Do you really want to remove?')).toBeInTheDocument();
      });
    });

    it('should remove entity on confirmation', async () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      const deleteIcon = container.querySelector('.wrap-icon svg') as HTMLElement;
      fireEvent.click(deleteIcon);

      await waitFor(() => {
        expect(screen.getAllByText('Confirm')[0]).toBeInTheDocument();
      });

      const okButton = screen.getAllByRole('button', { name: /ok/i })[0];
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockRemoveEntity).toHaveBeenCalledWith(mockEntity);
      });
    });

    it('should call onResetRequestClass when deleting last entity', async () => {
      const onResetRequestClass = vi.fn();

      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
          onResetRequestClass={onResetRequestClass}
        />
      );

      // Verify there's only one entity-viewer
      expect(document.querySelectorAll('.entity-viewer').length).toBe(1);

      const deleteIcon = container.querySelector('.wrap-icon svg') as HTMLElement;
      fireEvent.click(deleteIcon);

      await waitFor(() => {
        expect(screen.getAllByText('Confirm')[0]).toBeInTheDocument();
      });

      const okButton = screen.getAllByRole('button', { name: /ok/i })[0];
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockRemoveEntity).toHaveBeenCalledWith(mockEntity);
        expect(onResetRequestClass).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Drag and Drop', () => {
    it('should update position on mouse drag', () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      const entityViewer = container.querySelector('.entity-viewer') as HTMLElement;
      
      // Start drag
      fireEvent.mouseDown(entityViewer, { clientX: 100, clientY: 100 });
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
      
      // Check position updated
      expect(entityViewer.style.left).toBe('50px');
      expect(entityViewer.style.top).toBe('50px');
      
      // End drag
      fireEvent.mouseUp(document);
    });

    it('should add dragging class during drag', () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      const entityViewer = container.querySelector('.entity-viewer') as HTMLElement;
      
      fireEvent.mouseDown(entityViewer, { clientX: 100, clientY: 100 });
      
      expect(entityViewer).toHaveClass('dragging');
      
      fireEvent.mouseUp(document);
      
      expect(entityViewer).not.toHaveClass('dragging');
    });

    it('should not drag when clicking delete icon', () => {
      const { container } = render(
        <EntityViewer
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      const deleteIcon = container.querySelector('.wrap-icon') as HTMLElement;
      const entityViewer = container.querySelector('.entity-viewer') as HTMLElement;

      const initialLeft = entityViewer.style.left;

      fireEvent.mouseDown(deleteIcon, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });

      expect(entityViewer.style.left).toBe(initialLeft);
    });
  });

  describe('Ref Methods', () => {
    it('should expose drawLines method via ref', () => {
      const ref = { current: null } as any;
      
      render(
        <EntityViewer
          ref={ref}
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      expect(ref.current).toBeDefined();
      expect(ref.current.drawLines).toBeDefined();
      expect(typeof ref.current.drawLines).toBe('function');
    });

    it('should draw SVG lines when drawLines is called', () => {
      const ref = { current: null } as any;

      // Create mock SVG canvas
      const svgCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgCanvas.classList.add('canvas');
      const container = document.createElement('div');
      container.classList.add('wrap-entity-view-box-inner');
      container.appendChild(svgCanvas);
      document.body.appendChild(container);

      render(
        <EntityViewer
          ref={ref}
          requestClass="com.cyoda.core.Entity"
          entity={mockEntity}
        />
      );

      // Call drawLines
      ref.current.drawLines();

      // Should not throw error (canvas exists)
      expect(ref.current.drawLines).not.toThrow();

      // Cleanup
      document.body.removeChild(container);
    });
  });
});

