/*
  # Add Persona Fields to Profiles Table

  This migration adds persona-related fields to the profiles table to support
  user onboarding and persona selection as part of the authentication flow.

  New Fields:
  - persona_segment: The user's selected persona (SMB, SOLO, EXEC, FREELANCER, ASPIRING)
  - onboarding_completed: Boolean flag indicating if user has completed onboarding
  - organization_name: Optional organization name for business personas
  - organization_size: Optional organization size for business personas
*/

-- Add persona-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN persona_segment text,
ADD COLUMN onboarding_completed boolean DEFAULT false,
ADD COLUMN organization_name text,
ADD COLUMN organization_size text;

-- Add check constraint for valid persona segments
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_persona_segment 
CHECK (persona_segment IS NULL OR persona_segment IN ('SMB', 'SOLO', 'EXEC', 'FREELANCER', 'ASPIRING'));

-- Add index on persona_segment for performance
CREATE INDEX profiles_persona_segment_idx ON public.profiles USING btree (persona_segment);

-- Add index on onboarding_completed for performance
CREATE INDEX profiles_onboarding_completed_idx ON public.profiles USING btree (onboarding_completed);

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, persona_segment, onboarding_completed)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'phone', 
    NEW.email,
    NULL, -- persona_segment will be set during onboarding
    false -- onboarding_completed starts as false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
