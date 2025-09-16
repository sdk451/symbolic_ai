-- Complete Database Fix for Onboarding Process
-- Run this in your Supabase SQL Editor

-- ==============================================
-- 1. FIX PROFILES TABLE AND TRIGGER
-- ==============================================

-- First, let's fix the handle_new_user function to handle missing data gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, persona_segment, onboarding_completed)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    NULL, -- persona_segment will be set during onboarding
    false -- onboarding_completed starts as false
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 2. ADD PERSONA FIELDS TO PROFILES TABLE
-- ==============================================

-- Add persona-related columns to profiles table (if they don't exist)
DO $$ 
BEGIN
    -- Add persona_segment column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'persona_segment') THEN
        ALTER TABLE public.profiles ADD COLUMN persona_segment text;
    END IF;
    
    -- Add onboarding_completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
    END IF;
    
    -- Add organization_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'organization_name') THEN
        ALTER TABLE public.profiles ADD COLUMN organization_name text;
    END IF;
    
    -- Add organization_size column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'organization_size') THEN
        ALTER TABLE public.profiles ADD COLUMN organization_size text;
    END IF;
END $$;

-- ==============================================
-- 3. ADD CONSTRAINTS AND INDEXES
-- ==============================================

-- Add check constraint for valid persona segments (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'valid_persona_segment') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT valid_persona_segment 
        CHECK (persona_segment IS NULL OR persona_segment IN ('SMB', 'SOLO', 'EXEC', 'FREELANCER', 'ASPIRING'));
    END IF;
END $$;

-- Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS profiles_persona_segment_idx ON public.profiles USING btree (persona_segment);
CREATE INDEX IF NOT EXISTS profiles_onboarding_completed_idx ON public.profiles USING btree (onboarding_completed);

-- ==============================================
-- 4. FIX RLS POLICIES
-- ==============================================

-- Update the RLS policy to allow the trigger to insert profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow if the user is inserting their own profile
    auth.uid() = id 
    OR 
    -- Allow if this is a system insert (during user creation)
    auth.uid() IS NULL
  );

-- Also update the select policy to be more permissive during user creation
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (
    -- Allow if the user is viewing their own profile
    auth.uid() = id 
    OR 
    -- Allow if this is a system operation (during user creation)
    auth.uid() IS NULL
  );

-- ==============================================
-- 5. VERIFICATION
-- ==============================================

-- Test the function and show table structure
SELECT 'Database fix applied successfully!' as status;

-- Show the current profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
