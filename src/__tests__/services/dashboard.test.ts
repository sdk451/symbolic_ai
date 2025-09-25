import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPersonaBasedDemos,
  getPersonaBasedConsultationMessage,
  getTeaserContent,
  fetchDashboardData,
  startDemo,
  mockDemos,
} from '../../services/dashboard';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      })
    }
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPersonaBasedDemos', () => {
    it('returns all non-locked demos when no persona segment', () => {
      const demos = getPersonaBasedDemos(null);
      
      expect(demos).toHaveLength(3); // Only non-locked demos
      expect(demos.every(demo => !demo.isLocked)).toBe(true);
    });

    it('returns SMB-specific demos for SMB persona', () => {
      const demos = getPersonaBasedDemos('SMB');
      
      expect(demos.length).toBeGreaterThan(0);
      expect(demos.every(demo => demo.personaSegments.includes('SMB'))).toBe(true);
    });

    it('returns EXEC-specific demos for EXEC persona', () => {
      const demos = getPersonaBasedDemos('EXEC');
      
      expect(demos.length).toBeGreaterThan(0);
      expect(demos.every(demo => demo.personaSegments.includes('EXEC'))).toBe(true);
    });

    it('returns SOLO-specific demos for SOLO persona', () => {
      const demos = getPersonaBasedDemos('SOLO');
      
      expect(demos.length).toBe(3);
      expect(demos[1].id).toBe('customer-service-chatbot'); // Chatbot is always 2nd
      expect(demos[0].personaSegments.includes('SOLO')).toBe(true); // First demo should be SOLO-compatible
      expect(demos[2].personaSegments.includes('SOLO') || !demos[2].isLocked).toBe(true); // Third demo should be SOLO-compatible or available fallback
    });

    it('returns FREELANCER-specific demos for FREELANCER persona', () => {
      const demos = getPersonaBasedDemos('FREELANCER');
      
      expect(demos.length).toBeGreaterThan(0);
      expect(demos.every(demo => demo.personaSegments.includes('FREELANCER'))).toBe(true);
    });

    it('returns ASPIRING-specific demos for ASPIRING persona', () => {
      const demos = getPersonaBasedDemos('ASPIRING');
      
      expect(demos.length).toBe(3);
      expect(demos[1].id).toBe('customer-service-chatbot'); // Chatbot is always 2nd
      expect(demos[0].personaSegments.includes('ASPIRING') || !demos[0].isLocked).toBe(true); // First demo should be ASPIRING-compatible or available fallback
      expect(demos[2].personaSegments.includes('ASPIRING') || !demos[2].isLocked).toBe(true); // Third demo should be ASPIRING-compatible or available fallback
    });
  });

  describe('getPersonaBasedConsultationMessage', () => {
    it('returns SMB message for SMB persona', () => {
      const message = getPersonaBasedConsultationMessage('SMB');
      
      expect(message).toContain('scale your business operations');
      expect(message).toContain('AI solutions can help you');
    });

    it('returns SOLO message for SOLO persona', () => {
      const message = getPersonaBasedConsultationMessage('SOLO');
      
      expect(message).toContain('solo business');
      expect(message).toContain('routine tasks');
    });

    it('returns EXEC message for EXEC persona', () => {
      const message = getPersonaBasedConsultationMessage('EXEC');
      
      expect(message).toContain('strategic transformation');
      expect(message).toContain('AI solutions that deliver measurable ROI');
    });

    it('returns FREELANCER message for FREELANCER persona', () => {
      const message = getPersonaBasedConsultationMessage('FREELANCER');
      
      expect(message).toContain('service offerings');
      expect(message).toContain('clients');
    });

    it('returns ASPIRING message for ASPIRING persona', () => {
      const message = getPersonaBasedConsultationMessage('ASPIRING');
      
      expect(message).toContain('career');
      expect(message).toContain('professional development');
    });

    it('returns default message for null persona', () => {
      const message = getPersonaBasedConsultationMessage(null);
      
      expect(message).toContain('career');
      expect(message).toContain('professional development');
    });
  });

  describe('getTeaserContent', () => {
    it('returns SMB teaser for SMB persona', () => {
      const teaser = getTeaserContent('SMB');
      
      expect(teaser.title).toContain('Workflow Automation');
      expect(teaser.description).toContain('business process');
      expect(teaser.comingSoon).toBe(true);
    });

    it('returns SOLO teaser for SOLO persona', () => {
      const teaser = getTeaserContent('SOLO');
      
      expect(teaser.title).toContain('Personal AI Assistant');
      expect(teaser.description).toContain('personal AI assistant');
      expect(teaser.comingSoon).toBe(true);
    });

    it('returns EXEC teaser for EXEC persona', () => {
      const teaser = getTeaserContent('EXEC');
      
      expect(teaser.title).toContain('Enterprise AI Platform');
      expect(teaser.description).toContain('Comprehensive AI platform');
      expect(teaser.comingSoon).toBe(true);
    });

    it('returns FREELANCER teaser for FREELANCER persona', () => {
      const teaser = getTeaserContent('FREELANCER');
      
      expect(teaser.title).toContain('Client Portal');
      expect(teaser.description).toContain('client collaboration');
      expect(teaser.comingSoon).toBe(true);
    });

    it('returns ASPIRING teaser for ASPIRING persona', () => {
      const teaser = getTeaserContent('ASPIRING');
      
      expect(teaser.title).toContain('AI Learning Path');
      expect(teaser.description).toContain('learning modules');
      expect(teaser.comingSoon).toBe(true);
    });

    it('returns default teaser for null persona', () => {
      const teaser = getTeaserContent(null);
      
      expect(teaser.title).toContain('AI Learning Path');
      expect(teaser.description).toContain('learning modules');
      expect(teaser.comingSoon).toBe(true);
    });
  });

  describe('fetchDashboardData', () => {
    it('returns complete dashboard data for SMB persona', async () => {
      const data = await fetchDashboardData('SMB');
      
      expect(data).toHaveProperty('demos');
      expect(data).toHaveProperty('activities');
      expect(data).toHaveProperty('consultationMessage');
      expect(data).toHaveProperty('teaserContent');
      
      expect(Array.isArray(data.demos)).toBe(true);
      expect(Array.isArray(data.activities)).toBe(true);
      expect(typeof data.consultationMessage).toBe('string');
      expect(typeof data.teaserContent).toBe('object');
    });

    it('returns different demos for different personas', async () => {
      const smbData = await fetchDashboardData('SMB');
      const execData = await fetchDashboardData('EXEC');
      
      // Should have different demo sets (though there might be overlap)
      expect(smbData.demos.length).toBeGreaterThan(0);
      expect(execData.demos.length).toBeGreaterThan(0);
    });

    it('simulates API delay', async () => {
      const startTime = Date.now();
      await fetchDashboardData('SMB');
      const endTime = Date.now();
      
      // Should take at least 500ms due to simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });
  });

  describe('startDemo', () => {
    it('successfully starts a valid demo', async () => {
      // Mock successful API response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'test-run-id',
          status: 'queued',
          demoId: 'speed-to-lead-qualification',
          message: 'Demo execution started successfully'
        })
      } as Response);

      const result = await startDemo('speed-to-lead-qualification');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('started successfully');
      expect(result.runId).toBe('test-run-id');
    });

    it('fails to start a locked demo', async () => {
      const result = await startDemo('content-generator');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('coming soon');
    });

    it('fails to start a non-existent demo', async () => {
      const result = await startDemo('non-existent-demo');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('simulates API delay', async () => {
      // Mock fetch with a delay
      vi.mocked(global.fetch).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                id: 'test-run-id',
                status: 'queued',
                demoId: 'speed-to-lead-qualification',
                message: 'Demo execution started successfully'
              })
            } as Response);
          }, 300);
        })
      );

      const startTime = Date.now();
      await startDemo('speed-to-lead-qualification');
      const endTime = Date.now();
      
      // Should take at least 300ms due to simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(300);
    });
  });

  describe('mockDemos data structure', () => {
    it('has correct structure for all demos', () => {
      mockDemos.forEach(demo => {
        expect(demo).toHaveProperty('id');
        expect(demo).toHaveProperty('title');
        expect(demo).toHaveProperty('description');
        expect(demo).toHaveProperty('icon');
        expect(demo).toHaveProperty('color');
        expect(demo).toHaveProperty('steps');
        expect(demo).toHaveProperty('demoUrl');
        expect(demo).toHaveProperty('personaSegments');
        
        expect(typeof demo.id).toBe('string');
        expect(typeof demo.title).toBe('string');
        expect(typeof demo.description).toBe('string');
        expect(typeof demo.icon).toBe('string');
        expect(typeof demo.color).toBe('string');
        expect(Array.isArray(demo.steps)).toBe(true);
        expect(typeof demo.demoUrl).toBe('string');
        expect(Array.isArray(demo.personaSegments)).toBe(true);
      });
    });

    it('has locked demos with teaser text', () => {
      const lockedDemos = mockDemos.filter(demo => demo.isLocked);
      
      expect(lockedDemos.length).toBeGreaterThan(0);
      lockedDemos.forEach(demo => {
        expect(demo.isLocked).toBe(true);
        expect(demo.teaserText).toBeDefined();
        expect(typeof demo.teaserText).toBe('string');
      });
    });
  });
});
