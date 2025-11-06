import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { VersionMismatch } from './VersionMismatch'

describe('VersionMismatch', () => {
  it('does not render when versions match', () => {
    const { container } = render(
      <VersionMismatch platformVersion="1.2.3" uiVersion="1.2.3" />
    )
    expect(container.querySelector('.cyoda-version-mismatch')).not.toBeInTheDocument()
  })

  it('renders warning when versions do not match', async () => {
    render(<VersionMismatch platformVersion="1.2.3" uiVersion="2.0.0" />)

    await waitFor(() => {
      expect(screen.getByText('Version Mismatch')).toBeInTheDocument()
    })
  })

  it('displays platform and UI versions in warning message', async () => {
    const { container } = render(
      <VersionMismatch platformVersion="1.2.3" uiVersion="2.0.0" />
    )

    await waitFor(() => {
      expect(container.textContent).toContain('Platform version: 1.2.3')
      expect(container.textContent).toContain('UI version is 2.0.0')
    })
  })

  it('extracts semantic version from longer version strings', async () => {
    render(
      <VersionMismatch 
        platformVersion="v1.2.3-beta.1" 
        uiVersion="v1.2.3-alpha.2" 
      />
    )

    await waitFor(() => {
      // Should match because semantic versions are the same (1.2.3)
      expect(screen.queryByText('Version Mismatch')).not.toBeInTheDocument()
    })
  })

  it('shows warning when semantic versions differ', async () => {
    render(
      <VersionMismatch 
        platformVersion="v1.2.3-beta" 
        uiVersion="v2.0.0-alpha" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Version Mismatch')).toBeInTheDocument()
    })
  })

  it('calls onCheckVersion to load platform version', async () => {
    const onCheckVersion = vi.fn().mockResolvedValue({ version: '1.2.3' })
    render(<VersionMismatch uiVersion="2.0.0" onCheckVersion={onCheckVersion} />)

    await waitFor(() => {
      expect(onCheckVersion).toHaveBeenCalled()
    })
  })

  it('uses loaded platform version for comparison', async () => {
    const onCheckVersion = vi.fn().mockResolvedValue({ version: '1.2.3' })
    render(<VersionMismatch uiVersion="2.0.0" onCheckVersion={onCheckVersion} />)

    await waitFor(() => {
      expect(screen.getByText('Version Mismatch')).toBeInTheDocument()
    })
  })

  it('does not call onCheckVersion if platformVersion is provided', async () => {
    const onCheckVersion = vi.fn()
    render(
      <VersionMismatch 
        platformVersion="1.2.3" 
        uiVersion="1.2.3" 
        onCheckVersion={onCheckVersion} 
      />
    )

    await waitFor(() => {
      expect(onCheckVersion).not.toHaveBeenCalled()
    })
  })

  it('renders alert with warning type', async () => {
    const { container } = render(
      <VersionMismatch platformVersion="1.2.3" uiVersion="2.0.0" />
    )

    await waitFor(() => {
      const alert = container.querySelector('.ant-alert-warning')
      expect(alert).toBeInTheDocument()
    })
  })

  it('renders alert with icon', async () => {
    const { container } = render(
      <VersionMismatch platformVersion="1.2.3" uiVersion="2.0.0" />
    )

    await waitFor(() => {
      const icon = container.querySelector('.ant-alert-icon')
      expect(icon).toBeInTheDocument()
    })
  })
})

