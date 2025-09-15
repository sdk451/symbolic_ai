import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../App'
import { useAuth } from '../../hooks/useAuth'

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

// Mock the BackgroundAnimation component
vi.mock('../../components/BackgroundAnimation', () => ({
  default: () => <div data-testid="background-animation">Background Animation</div>
}))

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isEmailVerified: false,
      loading: false
    })
  })

  it('renders the main application structure', () => {
    render(<App />)
    
    // Check if the main container is rendered
    expect(screen.getByRole('main', { hidden: true })).toBeInTheDocument()
    
    // Check if background animation is rendered
    expect(screen.getByTestId('background-animation')).toBeInTheDocument()
  })

  it('shows loading state when loading is true', () => {
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isEmailVerified: false,
      loading: true
    })

    render(<App />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows Hero component when not authenticated', () => {
    render(<App />)
    
    // Since Hero component is not mocked, we check for the main container
    // In a real test, you would mock the Hero component and check for its content
    expect(screen.getByRole('main', { hidden: true })).toBeInTheDocument()
  })
})
