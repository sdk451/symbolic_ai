import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CallSummaryModal from '../../components/demo/CallSummaryModal';


const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CallSummaryModal', () => {
  const mockOnClose = vi.fn();
  const mockCallData = {
    callId: 'call-123-456',
    duration: 180, // 3 minutes
    qualificationScore: 85,
    summary: 'The lead showed strong interest in our services and has a budget allocated for Q2. They are looking for a solution to automate their lead qualification process.',
    nextSteps: [
      'Schedule a follow-up call for next week',
      'Send detailed proposal with pricing',
      'Connect with their technical team for integration discussion'
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    expect(screen.getAllByRole('heading', { name: 'Call Summary' })[0]).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={false}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    expect(screen.queryByText('Call Summary')).not.toBeInTheDocument();
  });

  it('displays call details correctly', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    expect(screen.getByText('call-123-456')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument(); // 180 seconds = 3:00
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('High Quality Lead')).toBeInTheDocument();
  });

  it('displays call summary', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    expect(screen.getAllByRole('heading', { name: 'Call Summary' })[0]).toBeInTheDocument();
    expect(screen.getByText(mockCallData.summary)).toBeInTheDocument();
  });

  it('displays next steps', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    expect(screen.getByText('Recommended Next Steps')).toBeInTheDocument();
    
    mockCallData.nextSteps.forEach((step, index) => {
      expect(screen.getByText(step)).toBeInTheDocument();
      expect(screen.getByText((index + 1).toString())).toBeInTheDocument();
    });
  });

  it('shows correct score color for high quality lead', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    const scoreElement = screen.getByText('85');
    expect(scoreElement).toHaveClass('text-green-400');
  });

  it('shows correct score color for medium quality lead', () => {
    const mediumScoreData = { ...mockCallData, qualificationScore: 70 };
    
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mediumScoreData}
      />
    );

    const scoreElement = screen.getByText('70');
    expect(scoreElement).toHaveClass('text-yellow-400');
    expect(screen.getByText('Medium Quality Lead')).toBeInTheDocument();
  });

  it('shows correct score color for low quality lead', () => {
    const lowScoreData = { ...mockCallData, qualificationScore: 45 };
    
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={lowScoreData}
      />
    );

    const scoreElement = screen.getByText('45');
    expect(scoreElement).toHaveClass('text-red-400');
    expect(screen.getByText('Low Quality Lead')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    const longCallData = { ...mockCallData, duration: 3661 }; // 1 hour, 1 minute, 1 second
    
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={longCallData}
      />
    );

    expect(screen.getByText('61:01')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows schedule follow-up button', () => {
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={mockCallData}
      />
    );

    expect(screen.getByText('Schedule Follow-up')).toBeInTheDocument();
  });

  it('handles empty next steps', () => {
    const emptyStepsData = { ...mockCallData, nextSteps: [] };
    
    renderWithRouter(
      <CallSummaryModal
        isOpen={true}
        onClose={mockOnClose}
        callData={emptyStepsData}
      />
    );

    expect(screen.getByText('Recommended Next Steps')).toBeInTheDocument();
    // Should not crash with empty next steps
  });
});
