import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'
import { useAuth } from '../../hooks/useAuth'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

// Mock the BackgroundAnimation component
vi.mock('../../components/BackgroundAnimation', () => ({
  default: () => <div data-testid="background-animation">Background Animation</div>
}))

// Mock all the page components
vi.mock('../../pages/auth/onboarding', () => ({
  default: () => <div data-testid="onboarding-page">Onboarding Page</div>
}))

vi.mock('../../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

// Mock all the main components
vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}))

vi.mock('../../components/Hero', () => ({
  default: () => <div data-testid="hero">Hero</div>
}))

vi.mock('../../components/Demos', () => ({
  default: () => <div data-testid="demos">Demos</div>
}))

vi.mock('../../components/Services', () => ({
  default: () => <div data-testid="services">Services</div>
}))

vi.mock('../../components/Solutions', () => ({
  default: () => <div data-testid="solutions">Solutions</div>
}))

vi.mock('../../components/Courses', () => ({
  default: () => <div data-testid="courses">Courses</div>
}))

vi.mock('../../components/Approach', () => ({
  default: () => <div data-testid="approach">Approach</div>
}))

vi.mock('../../components/Advisory', () => ({
  default: () => <div data-testid="advisory">Advisory</div>
}))

vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      session: null,
      isAuthenticated: false,
      isEmailVerified: false,
      loading: false
    })
  })

  it('renders the main application structure', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Check if background animation is rendered
    expect(screen.getByTestId('background-animation')).toBeTruthy()
    
    // Check if main components are rendered
    expect(screen.getByTestId('navbar')).toBeTruthy()
    expect(screen.getByTestId('hero')).toBeTruthy()
    expect(screen.getByTestId('services')).toBeTruthy()
    expect(screen.getByTestId('footer')).toBeTruthy()
  })

  it('shows loading state when loading is true', () => {
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      session: null,
      isAuthenticated: false,
      isEmailVerified: false,
      loading: true
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('shows Hero component when not authenticated', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('hero')).toBeTruthy()
    expect(screen.queryByTestId('demos')).toBeFalsy()
  })

  it('shows Demos component when authenticated and onboarding completed', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      profile: { onboarding_completed: true },
      session: {},
      isAuthenticated: true,
      isEmailVerified: true,
      loading: false
    })

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('demos')).toBeTruthy()
    expect(screen.queryByTestId('hero')).toBeFalsy()
  })
})
