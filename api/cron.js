import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Check authorization in Production to securely allow only Vercel Cron to invoke
  if (
    process.env.CRON_SECRET &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const oneSignalAppId = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID;
  const oneSignalRestKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!supabaseUrl || !supabaseKey || !oneSignalAppId || !oneSignalRestKey) {
    console.error("Missing required environment variables for cron.");
    return res.status(500).json({ error: 'Missing environment variables.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split('T')[0];

    const { data: leads, error } = await supabase
      .from('leads')
      .select('name, follow_up_date')
      .eq('follow_up_date', today);

    if (error) {
      throw error;
    }

    if (!leads || leads.length === 0) {
      return res.status(200).json({ message: 'No follow-ups for today.' });
    }

    // Send Push Notification
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${oneSignalRestKey}`
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        included_segments: ['Subscribed Users'], // Push to all subscribed users
        headings: { en: "Follow-ups Due Today!" },
        contents: { en: `You have ${leads.length} follow-up(s) scheduled for today. Don't forget to reach out to them.` },
        // To make URL dynamic for the CRM, you can replace it later if deployed on a specific domain.
        // url: "https://your-crm-url.com/follow-ups"
      })
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("OneSignal Error:", result);
        return res.status(500).json({ error: 'Failed to send push notification', details: result });
    }

    return res.status(200).json({ message: `Successfully sent notification for ${leads.length} leads.`, onesignal: result });
  } catch (error) {
    console.error("Cron Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
