import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const NOTIFICATION_EMAIL = "your-email@webgrit.com" // CHANGE THIS TO YOUR EMAIL

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Webhook Received:", payload)

    const record = payload.record // The new lead data
    const oldRecord = payload.old_record // The old lead data

    // Only send if the pipeline stage changed
    if (oldRecord && record.pipeline_stage === oldRecord.pipeline_stage) {
      return new Response(JSON.stringify({ message: "No stage change, ignoring." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    const htmlContent = `
      <h2>Lead Stage Updated!</h2>
      <p><strong>Lead:</strong> ${record.name}</p>
      <p><strong>New Stage:</strong> ${record.pipeline_stage}</p>
      <p><strong>Value:</strong> ₹${record.deal_value || 0}</p>
      <br />
      <p>Login to your CRM to take action.</p>
    `

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CRM Notifications <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `Lead Update: ${record.name} is now in ${record.pipeline_stage}`,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})

// === INSTRUCTIONS TO DEPLOY ===
// 1. Install Supabase CLI: npm i -g supabase
// 2. Login to Supabase: supabase login
// 3. Link your project: supabase link --project-ref your-project-ref
// 4. Set the Secret: supabase secrets set RESEND_API_KEY=re_your_secret_key
// 5. Deploy the function: supabase functions deploy send-email --no-verify-jwt
// 6. Go to Supabase Dashboard -> Database -> Webhooks -> Add Webhook
//    - Table: leads
//    - Events: UPDATE
//    - Type: HTTP Request -> POST -> URL: https://your-project-ref.supabase.co/functions/v1/send-email
