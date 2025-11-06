import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { VersionInfo } from './VersionInfo'

describe('VersionInfo', () => {
  const mockPlatform = {
    version: '1.2.3',
    buildTime: '2024-01-01 12:00:00',
    gitBranchName: 'main'
  }

  const mockClient = {
    version: '2.3.4',
    buildTime: '2024-01-02 13:00:00',
    gitBranchName: 'develop'
  }

  it('renders version link', () => {
    render(<VersionInfo />)
    expect(screen.getByText('Version App')).toBeInTheDocument()
  })

  it('renders custom link text', () => {
    render(<VersionInfo linkText="Custom Version" />)
    expect(screen.getByText('Custom Version')).toBeInTheDocument()
  })

  it('opens modal on link click', async () => {
    const user = userEvent.setup()
    render(<VersionInfo platform={mockPlatform} client={mockClient} />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('Platform')).toBeInTheDocument()
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('UI')).toBeInTheDocument()
    })
  })

  it('displays platform version info', async () => {
    const user = userEvent.setup()
    render(<VersionInfo platform={mockPlatform} />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('Platform')).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('1.2.3')
      expect(modalBody?.textContent).toContain('2024-01-01 12:00:00')
      expect(modalBody?.textContent).toContain('main')
    }, { timeout: 3000 })
  })

  it('displays client version info', async () => {
    const user = userEvent.setup()
    render(<VersionInfo client={mockClient} />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('Client')).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('2.3.4')
      expect(modalBody?.textContent).toContain('2024-01-02 13:00:00')
      expect(modalBody?.textContent).toContain('develop')
    }, { timeout: 3000 })
  })

  it('displays UI version info', async () => {
    const user = userEvent.setup()
    render(<VersionInfo uiVersion="3.4.5" uiBuildTime="2024-01-03" uiBranchName="feature" />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('UI')).toBeInTheDocument()
    })

    await waitFor(() => {
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody?.textContent).toContain('3.4.5')
      expect(modalBody?.textContent).toContain('2024-01-03')
      expect(modalBody?.textContent).toContain('feature')
    }, { timeout: 3000 })
  })

  it('calls onLoadPlatform when modal opens', async () => {
    const user = userEvent.setup()
    const onLoadPlatform = vi.fn().mockResolvedValue(mockPlatform)
    render(<VersionInfo onLoadPlatform={onLoadPlatform} />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(onLoadPlatform).toHaveBeenCalled()
    })
  })

  it('calls onLoadClient when modal opens', async () => {
    const user = userEvent.setup()
    const onLoadClient = vi.fn().mockResolvedValue(mockClient)
    render(<VersionInfo onLoadClient={onLoadClient} />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(onLoadClient).toHaveBeenCalled()
    })
  })

  it('closes modal on close button click', async () => {
    const user = userEvent.setup()
    render(<VersionInfo />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('Platform')).toBeInTheDocument()
    })

    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    // Click the footer close button (last one)
    await user.click(closeButtons[closeButtons.length - 1])

    await waitFor(() => {
      // Check that the modal wrapper is hidden
      const modalWrap = document.querySelector('.ant-modal-wrap') as HTMLElement
      expect(modalWrap?.style.display).toBe('none')
    })
  })

  it('displays dash for missing values', async () => {
    const user = userEvent.setup()
    render(<VersionInfo />)

    const link = screen.getByText('Version App')
    await user.click(link)

    await waitFor(() => {
      expect(screen.getByText('Platform')).toBeInTheDocument()
    })

    await waitFor(() => {
      // Check for the "Version:" label and its corresponding dash value
      const versionLabels = screen.getAllByText(/Version:/)
      expect(versionLabels.length).toBeGreaterThan(0)

      // Find dash values in the modal body
      const modalBody = document.querySelector('.ant-modal-body')
      expect(modalBody).toBeTruthy()
      expect(modalBody?.textContent).toContain('-')
    }, { timeout: 3000 })
  })
})

