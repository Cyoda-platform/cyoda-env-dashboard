/**
 * SummaryConsole Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SummaryConsole } from '../SummaryConsole';

// Mock useParams
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

describe('SummaryConsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseParams.mockReturnValue({ name: '10.233.75.58' });
  });

  describe('Rendering', () => {
    it('should render Console card', () => {
      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      expect(screen.getByText('Console')).toBeInTheDocument();
    });

    it('should render Launch Console button', () => {
      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      expect(screen.getByText('Launch Console')).toBeInTheDocument();
    });

    it('should render Settings icon', () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      expect(settingsIcon).toBeInTheDocument();
    });
  });

  describe('SSH Settings Modal', () => {
    it('should open SSH Settings modal when clicking settings icon', async () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        expect(screen.getByText('SSH Settings')).toBeInTheDocument();
      });
    });

    it('should display form fields in SSH Settings modal', async () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        expect(screen.getByLabelText('Host name')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
      });
    });

    it('should pre-fill hostname from URL params', async () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        const hostnameInput = screen.getByLabelText('Host name') as HTMLInputElement;
        expect(hostnameInput.value).toBe('10.233.75.58');
      });
    });

    it('should close modal when clicking Close button', async () => {
      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = screen.getByRole('img', { name: 'setting' });
      fireEvent.click(settingsIcon);

      await waitFor(() => {
        expect(screen.getByText('SSH Settings')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      // Wait for modal to close - the title should no longer be visible
      await waitFor(
        () => {
          // Modal is closed when we can't find the title anymore (it's hidden with display: none)
          const title = screen.queryByText('SSH Settings');
          // In Ant Design, modal stays in DOM but is hidden, so we check if it's not visible
          expect(title).not.toBeVisible();
        },
        { timeout: 2000 }
      );
    });

    it('should save settings to localStorage when clicking Save', async () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
      });

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        const stored = localStorage.getItem('ssh-settings');
        expect(stored).toBeTruthy();
        
        if (stored) {
          const settings = JSON.parse(stored);
          expect(settings).toHaveLength(1);
          expect(settings[0].name).toBe('10.233.75.58');
          expect(settings[0].form.username).toBe('testuser');
          expect(settings[0].form.password).toBe('testpass');
        }
      });
    });

    it('should load saved settings from localStorage', async () => {
      // Pre-populate localStorage
      const savedSettings = [
        {
          name: '10.233.75.58',
          form: {
            hostname: '10.233.75.58',
            username: 'saveduser',
            password: 'savedpass',
          },
        },
      ];
      localStorage.setItem('ssh-settings', JSON.stringify(savedSettings));

      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        
        expect(usernameInput.value).toBe('saveduser');
        expect(passwordInput.value).toBe('savedpass');
      });
    });

    it('should validate required fields', async () => {
      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
      });

      // Clear all fields
      const hostnameInput = screen.getByLabelText('Host name');
      fireEvent.change(hostnameInput, { target: { value: '' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter hostname')).toBeInTheDocument();
      });
    });
  });

  describe('SSH Console Modal', () => {
    it('should open SSH Console modal when clicking Launch Console', async () => {
      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const launchButton = screen.getByText('Launch Console');
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(screen.getByText('SSH Console')).toBeInTheDocument();
      });
    });

    it('should render iframe in console modal', async () => {
      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const launchButton = screen.getByText('Launch Console');
      fireEvent.click(launchButton);

      await waitFor(() => {
        const iframe = screen.getByTitle('SSH Console');
        expect(iframe).toBeInTheDocument();
      });
    });

    it('should close console modal when clicking Close', async () => {
      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const launchButton = screen.getByText('Launch Console');
      fireEvent.click(launchButton);

      await waitFor(() => {
        expect(screen.getByText('SSH Console')).toBeInTheDocument();
      });

      const closeButton = screen.getAllByText('Close')[0]; // First Close button
      fireEvent.click(closeButton);

      // Wait for modal to close - the title should no longer be visible
      await waitFor(
        () => {
          const title = screen.queryByText('SSH Console');
          // Modal is closed when title is not visible (hidden with display: none)
          expect(title).not.toBeVisible();
        },
        { timeout: 2000 }
      );
    });

    it('should use saved settings in console URL', async () => {
      // Pre-populate localStorage
      const savedSettings = [
        {
          name: '10.233.75.58',
          form: {
            hostname: '10.233.75.58',
            username: 'testuser',
            password: 'testpass',
          },
        },
      ];
      localStorage.setItem('ssh-settings', JSON.stringify(savedSettings));

      render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const launchButton = screen.getByText('Launch Console');
      fireEvent.click(launchButton);

      await waitFor(() => {
        const iframe = screen.getByTitle('SSH Console') as HTMLIFrameElement;
        expect(iframe.src).toContain('hostname=10.233.75.58');
        expect(iframe.src).toContain('username=testuser');
      });
    });
  });

  describe('LocalStorage Integration', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('ssh-settings', 'invalid-json');

      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      // Should still render without crashing
      expect(screen.getByText('Console')).toBeInTheDocument();

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        // Should use default values
        const hostnameInput = screen.getByLabelText('Host name') as HTMLInputElement;
        expect(hostnameInput.value).toBe('10.233.75.58');
      });
    });

    it('should update existing settings for the same node', async () => {
      // Pre-populate with initial settings
      const initialSettings = [
        {
          name: '10.233.75.58',
          form: {
            hostname: '10.233.75.58',
            username: 'olduser',
            password: 'oldpass',
          },
        },
      ];
      localStorage.setItem('ssh-settings', JSON.stringify(initialSettings));

      const { container } = render(
        <BrowserRouter>
          <SummaryConsole />
        </BrowserRouter>
      );

      const settingsIcon = container.querySelector('.anticon-setting');
      fireEvent.click(settingsIcon!);

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
      });

      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        const stored = localStorage.getItem('ssh-settings');
        if (stored) {
          const settings = JSON.parse(stored);
          expect(settings).toHaveLength(1); // Should still be 1, not 2
          expect(settings[0].form.username).toBe('newuser');
        }
      });
    });
  });
});

