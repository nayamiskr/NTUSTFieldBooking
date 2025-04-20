import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zfdfpwbwaooaeyevkdjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZGZwd2J3YW9vYWV5ZXZrZGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDQ4OTcsImV4cCI6MjA2MDYyMDg5N30.txvp7VPOh078hXu52kKnEdZQxgasISaGjNpttEh73r0';

export const supabase = createClient(supabaseUrl, supabaseKey);