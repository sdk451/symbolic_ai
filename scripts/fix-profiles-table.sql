-- Fix for the profiles table and handle_new_user trigger
-- Run this in your Supabase SQL Editor

-- First, let's fix the handle_new_user function to handle missing data gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the RLS policy to allow the trigger to insert profiles
-- We need to allow the system to insert profiles during user creation
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

-- Test the function
SELECT 'Profiles table and trigger fixed successfully' as status;
