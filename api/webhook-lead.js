import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check authorization
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.WEBHOOK_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Parse lead data from body
  const leadData = req.body;
  if (!leadData || !leadData.name) {
    return res.status(400).json({ error: 'Bad Request: Missing lead name' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for webhook.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const newLead = {
      name: leadData.name,
      phone_number: leadData.phone_number || '',
      service_needed: leadData.service_needed || 'Other',
      deal_value: Number(leadData.deal_value) || 0,
      pipeline_stage: leadData.pipeline_stage || 'New',
      follow_up_date: leadData.follow_up_date || new Date().toISOString().split('T')[0],
      notes: leadData.notes || 'Imported via Webhook',
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([newLead])
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Lead added successfully', 
      lead: data[0] 
    });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
