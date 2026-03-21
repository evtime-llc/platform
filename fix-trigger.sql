CREATE OR REPLACE FUNCTION public.evtime_handle_new_user_profile()
RETURNS TRIGGER AS $
DECLARE
  user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'buyer');

  -- Validate role value
  IF user_role NOT IN ('buyer', 'seller', 'both') THEN
    user_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      ''
    ),
    user_role
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
