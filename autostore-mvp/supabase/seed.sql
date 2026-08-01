-- AutoStore AI — demo data
-- 1. Register a user in the app first (so a row exists in auth.users / public.profiles).
-- 2. Replace 'you@example.com' below with that account's email.
-- 3. Run this in the Supabase SQL editor.

do $$
declare
  target_user_id uuid;
  demo_store_id uuid;
  demo_product_id uuid;
begin
  select id into target_user_id from auth.users where email = 'you@example.com';

  if target_user_id is null then
    raise exception 'No user found with that email — register in the app first, then update the email in this script.';
  end if;

  insert into public.stores (user_id, name, platform, description, website_url)
  values (
    target_user_id,
    'Wanderlust Outfitters',
    'shopify',
    'Travel gear for people who never sit still — packable, durable, and built for the overhead bin.',
    'https://example.com'
  )
  returning id into demo_store_id;

  insert into public.products (store_id, name, description, price, category, tags)
  values (
    demo_store_id,
    'Packable Travel Daypack',
    'A 20L daypack that folds into its own pocket — water-resistant, lightweight, and built for carry-on travel.',
    39.99,
    'Bags',
    array['lightweight', 'water-resistant', 'packable']
  )
  returning id into demo_product_id;

  insert into public.products (store_id, name, description, price, category, tags)
  values (
    demo_store_id,
    'Compression Packing Cubes (Set of 4)',
    'Zip-compress your clothes to save space and keep your suitcase organized on every trip.',
    24.99,
    'Accessories',
    array['organization', 'compression', 'set of 4']
  );

  insert into public.orders (store_id, customer_name, customer_email, total_amount, shipping_address, shipping_deadline, status)
  values (
    demo_store_id,
    'Jamie Rivera',
    'jamie@example.com',
    64.98,
    '{"line1":"123 Main St","city":"Austin","state":"TX","postal_code":"78701","country":"US"}',
    now() + interval '2 days',
    'pending'
  );

  insert into public.orders (store_id, customer_name, customer_email, total_amount, shipping_address, shipping_deadline, status)
  values (
    demo_store_id,
    'Morgan Lee',
    'morgan@example.com',
    39.99,
    '{"line1":"456 Oak Ave","city":"Denver","state":"CO","postal_code":"80202","country":"US"}',
    now() - interval '1 day',
    'processing'
  );
end $$;
