import { supabase } from '../lib/supabase';

export interface ConsultationRequest {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  company_website?: string;
  services_of_interest: string[];
  project_timeline: string;
  estimated_budget: string;
  challenge_to_solve: string;
  company_size?: string; // Honeypot field
}

export const submitConsultationRequest = async (data: ConsultationRequest) => {
  try {
    // Honeypot spam detection - if company_size field is filled, it's likely a bot
    if (data.company_size && data.company_size.trim() !== '') {
      console.log('Spam detected: honeypot field was filled');
      throw new Error('Spam submission detected');
    }

    // Remove honeypot field before sending to database
    const { company_size, ...cleanData } = data;

    const { data: result, error } = await supabase
      .from('consultation_requests')
      .insert([{
        ...cleanData,
        status: 'pending',
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to submit consultation request');
    }

    return result;
  } catch (error) {
    console.error('Error submitting consultation request:', error);
    throw error;
  }
};