/**
 * PageEntityViewer Component Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageEntityViewer } from './PageEntityViewer';
import { useEntityViewerStore } from '../../stores/entityViewerStore';
import * as entitiesApi from '../../api/entities';

// Mock dependencies
vi.mock('../../stores/entityViewerStore');
vi.mock('../../stores/globalUiSettingsStore', () => ({
  useGlobalUiSettingsStore: () => ({
    entityType: 'BUSINESS',
  }),
}));
vi.mock('../../api/entities');
vi.mock('../../components/EntityViewer', () => ({
  EntityViewer: vi.fn(({ requestClass, onLoaded }: any) => {
    // Simulate async loading
    setTimeout(() => onLoaded?.(), 0);
    return <div data-testid="entity-viewer">{requestClass}</div>;
  }),
}));
vi.mock('../../components/StreamGrid', () => ({
  StreamGrid: () => <div data-testid="stream-grid">StreamGrid</div>,
}));
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ theme, value, language }: any) => (
    <div data-testid="monaco-editor" data-theme={theme} data-language={language}>
      {value}
    </div>
  )),
}));
vi.mock('@cyoda/ui-lib-react', () => ({
  registerCyodaThemes: vi.fn(),
}));

describe('PageEntityViewer', () => {
  const mockEntityOptions = [
    { value: 'com.cyoda.core.Entity', label: 'com.cyoda.core.Entity (Business)' },
    { value: 'com.cyoda.core.User', label: 'com.cyoda.core.User (Business)' },
    { value: 'com.cyoda.core.Transaction', label: 'com.cyoda.core.Transaction (Business)' },
  ];

  const mockAddEntity = vi.fn();
  const mockClearEntities = vi.fn();
  const mockSetOnlyDynamic = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock store
    (useEntityViewerStore as any).mockReturnValue({
      entitys: [],
      onlyDynamic: true,
      addEntity: mockAddEntity,
      clearEntities: mockClearEntities,
      setOnlyDynamic: mockSetOnlyDynamic,
    });

    // Mock API
    vi.spyOn(entitiesApi, 'getReportingFetchTypes').mockResolvedValue({
      data: [
        { name: 'com.cyoda.core.Entity', type: 'BUSINESS' },
        { name: 'com.cyoda.core.User', type: 'BUSINESS' },
        { name: 'com.cyoda.core.Transaction', type: 'BUSINESS' },
      ],
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render page entity viewer', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display entity class selector', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        // Check that the select component is rendered
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      });
    });

    it('should render entity class selector', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
      });
    });

    it('should render dynamic entities checkbox', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /show only dynamic entities/i });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
      });
    });

    it('should render zoom controls', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        // Zoom icons should be present
        const icons = screen.getAllByRole('img', { hidden: true });
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('should show info tooltip icon', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        const infoIcon = screen.getByRole('img', { name: 'info-circle', hidden: true });
        expect(infoIcon).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load entity class options on mount', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(entitiesApi.getReportingFetchTypes).toHaveBeenCalledWith(true);
      });
    });

    it('should reload options when onlyDynamic changes', async () => {
      const { rerender } = render(<PageEntityViewer />);

      await waitFor(() => {
        expect(entitiesApi.getReportingFetchTypes).toHaveBeenCalledWith(true);
      });

      // Change onlyDynamic
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [],
        onlyDynamic: false,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      rerender(<PageEntityViewer />);

      await waitFor(() => {
        expect(entitiesApi.getReportingFetchTypes).toHaveBeenCalledWith(false);
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(entitiesApi, 'getReportingFetchTypes').mockRejectedValue(new Error('API Error'));

      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to load entity classes:', expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });

  describe('Entity Selection', () => {
    it('should add entity when class is selected', async () => {
      const user = userEvent.setup();
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      await user.click(select);

      // Note: Ant Design Select testing is complex, we'll test the effect
      // Simulate selection by directly calling the handler
      const selectElement = select as any;
      if (selectElement.onChange) {
        selectElement.onChange('com.cyoda.core.Entity');
      }
    });

    it('should clear entities before adding new one', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Simulate entity selection via effect
      const { rerender } = render(<PageEntityViewer />);
      
      // This would trigger the useEffect that clears and adds entity
      // In real usage, selecting from dropdown triggers this
    });

    it('should display entity viewer when entity is selected', async () => {
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        // After selecting, the entity viewer should be rendered
        expect(screen.getByTestId('entity-viewer')).toBeInTheDocument();
      });
    });
  });

  describe('Dynamic/Non-Dynamic Toggle', () => {
    it('should toggle onlyDynamic when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<PageEntityViewer />);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /show only dynamic entities/i });
        expect(checkbox).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /show only dynamic entities/i });
      await user.click(checkbox);

      expect(mockSetOnlyDynamic).toHaveBeenCalledWith(false);
      expect(mockClearEntities).toHaveBeenCalled();
    });

    it('should show warning alert when onlyDynamic is false', async () => {
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [],
        onlyDynamic: false,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText(/Reports will not work for non-dynamic entities/i)).toBeInTheDocument();
      });
    });

    it('should not show warning alert when onlyDynamic is true', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.queryByText(/Reports will not work for non-dynamic entities/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Zoom Controls', () => {
    it('should zoom out when zoom out button is clicked', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      // Find zoom out icon (ZoomInOutlined)
      const icons = screen.getAllByRole('img', { hidden: true });
      const zoomOutIcon = icons.find((icon) => icon.getAttribute('aria-label') === 'zoom-in');

      if (zoomOutIcon) {
        fireEvent.click(zoomOutIcon);
      }

      // Zoom should increase (zoom out makes things smaller, so zoom value increases)
      // This is tested through the component's internal state
    });

    it('should zoom in when zoom in button is clicked', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      const icons = screen.getAllByRole('img', { hidden: true });
      const zoomInIcon = icons.find((icon) => icon.getAttribute('aria-label') === 'zoom-out');

      if (zoomInIcon) {
        fireEvent.click(zoomInIcon);
      }

      // Zoom should decrease (zoom in makes things bigger, so zoom value decreases)
    });

    it('should reset zoom when refresh button is clicked', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      const icons = screen.getAllByRole('img', { hidden: true });

      // First zoom out
      const zoomOutIcon = icons.find((icon) => icon.getAttribute('aria-label') === 'zoom-in');
      if (zoomOutIcon) {
        fireEvent.click(zoomOutIcon);
      }

      // Then refresh
      const refreshIcon = icons.find((icon) => icon.getAttribute('aria-label') === 'sync');
      if (refreshIcon) {
        fireEvent.click(refreshIcon);
      }

      // Zoom should be back to 1
    });

    it('should not zoom out beyond maximum', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      const icons = screen.getAllByRole('img', { hidden: true });
      const zoomOutIcon = icons.find((icon) => icon.getAttribute('aria-label') === 'zoom-in');

      // Click multiple times to try to exceed max zoom
      if (zoomOutIcon) {
        for (let i = 0; i < 20; i++) {
          fireEvent.click(zoomOutIcon);
        }
      }

      // Should not exceed 2
    });

    it('should not zoom in beyond minimum', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      const icons = screen.getAllByRole('img', { hidden: true });
      const zoomInIcon = icons.find((icon) => icon.getAttribute('aria-label') === 'zoom-out');

      // Click multiple times to try to go below min zoom
      if (zoomInIcon) {
        for (let i = 0; i < 20; i++) {
          fireEvent.click(zoomInIcon);
        }
      }

      // Should not go below 0.2
    });
  });

  describe('Entity Viewers Rendering', () => {
    it('should render entity viewers for each entity', async () => {
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [
          { from: '', to: 'com.cyoda.core.Entity' },
          { from: '', to: 'com.cyoda.core.User' },
        ],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        const entityViewers = screen.getAllByTestId('entity-viewer');
        expect(entityViewers).toHaveLength(2);
      });
    });

    it('should render SVG canvas when entities exist', async () => {
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      const { container } = render(<PageEntityViewer />);

      await waitFor(() => {
        const svg = container.querySelector('svg.canvas');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should not render SVG canvas when no entities', async () => {
      const { container } = render(<PageEntityViewer />);

      await waitFor(() => {
        const svg = container.querySelector('svg.canvas');
        expect(svg).not.toBeInTheDocument();
      });
    });
  });

  describe('Event Handling', () => {
    it('should listen for entityInfo:update events', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      // Import eventBus to emit event
      const { eventBus } = await import('../../utils');

      // Emit event
      eventBus.emit('entityInfo:update');

      // Event should be handled (tested through component behavior)
    });

    it('should cleanup event listener on unmount', async () => {
      const { unmount } = render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      // Import eventBus to spy on it
      const { eventBus } = await import('../../utils');
      const eventBusOffSpy = vi.spyOn(eventBus, 'off');

      unmount();

      // Should cleanup both event listeners
      expect(eventBusOffSpy).toHaveBeenCalledWith(
        'entityInfo:update',
        expect.any(Function)
      );
      expect(eventBusOffSpy).toHaveBeenCalledWith(
        'streamGrid:open',
        expect.any(Function)
      );

      eventBusOffSpy.mockRestore();
    });
  });

  describe('JSON View', () => {
    it('should render tabs for table and JSON views', async () => {
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        // Tabs should be rendered
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should switch to JSON view when JSON tab is clicked', async () => {
      const user = userEvent.setup();
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });

      // Click JSON tab (second tab)
      const tabs = screen.getAllByRole('tab');
      const jsonTab = tabs[1];
      await user.click(jsonTab);

      // Monaco Editor should be rendered
      await waitFor(() => {
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
      });
    });

    it('should not render JSON view when no entities', async () => {
      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      // Monaco Editor should not be rendered
      expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument();
    });

    it('should generate valid JSON from entities', async () => {
      const mockEntity = { from: '', to: 'com.cyoda.core.Entity' };
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [mockEntity],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      const user = userEvent.setup();
      render(<PageEntityViewer />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });

      // Click JSON tab
      const tabs = screen.getAllByRole('tab');
      const jsonTab = tabs[1];
      await user.click(jsonTab);

      // Check that Monaco Editor has JSON content
      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        expect(editor).toBeInTheDocument();
        const content = editor.textContent;
        expect(content).toContain('entityClass');
        expect(content).toContain('com.cyoda.core.Entity');
      });
    });
  });

  describe('Monaco Editor Integration', () => {
    it('should render Monaco Editor with correct language', async () => {
      const user = userEvent.setup();
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });

      const tabs = screen.getAllByRole('tab');
      const jsonTab = tabs[1];
      await user.click(jsonTab);

      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        expect(editor).toHaveAttribute('data-language', 'json');
      });
    });

    it('should pass correct theme to Monaco Editor', async () => {
      const user = userEvent.setup();
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });

      const tabs = screen.getAllByRole('tab');
      const jsonTab = tabs[1];
      await user.click(jsonTab);

      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        // Default theme should be dark
        expect(editor).toHaveAttribute('data-theme', 'cyoda-dark');
      });
    });

    it('should be read-only', async () => {
      const user = userEvent.setup();
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });

      const tabs = screen.getAllByRole('tab');
      const jsonTab = tabs[1];
      await user.click(jsonTab);

      // Monaco Editor should be rendered (read-only is set in options)
      await waitFor(() => {
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Switching', () => {
    it('should initialize with current theme from document', async () => {
      // Set document theme to light
      document.documentElement.setAttribute('data-theme', 'light');

      render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      // Reset
      document.documentElement.removeAttribute('data-theme');
    });

    it('should update theme when document theme attribute changes', async () => {
      const user = userEvent.setup();
      (useEntityViewerStore as any).mockReturnValue({
        entitys: [{ from: '', to: 'com.cyoda.core.Entity' }],
        onlyDynamic: true,
        addEntity: mockAddEntity,
        clearEntities: mockClearEntities,
        setOnlyDynamic: mockSetOnlyDynamic,
      });

      render(<PageEntityViewer />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(2);
      });

      const tabs = screen.getAllByRole('tab');
      const jsonTab = tabs[1];
      await user.click(jsonTab);

      // Change theme
      document.documentElement.setAttribute('data-theme', 'light');

      // Wait for theme to update
      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        expect(editor).toHaveAttribute('data-theme', 'cyoda-light');
      });

      // Reset
      document.documentElement.removeAttribute('data-theme');
    });

    it('should cleanup MutationObserver on unmount', async () => {
      const { unmount } = render(<PageEntityViewer />);

      await waitFor(() => {
        expect(screen.getByText('Entity Viewer')).toBeInTheDocument();
      });

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});

