import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin','staff'].includes(profile.role)) throw new Error('Not permitted');

    const { paymentId } = await req.json();
    if (!paymentId) throw new Error('paymentId is required');

    const { data: payment, error: paymentError } = await admin
      .from('payments')
      .select('id,receipt_no,amount,payment_mode,payment_date,customer_id')
      .eq('id', paymentId).single();
    if (paymentError || !payment) throw new Error('Payment not found');

    const { data: customer } = await admin
      .from('customers')
      .select('full_name,phone,scheme_id,schemes(name,duration_months,installment_amount)')
      .eq('id', payment.customer_id).single();
    if (!customer) throw new Error('Customer not found');

    const token = Deno.env.get('WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const template = Deno.env.get('WHATSAPP_TEMPLATE_NAME');
    const language = Deno.env.get('WHATSAPP_TEMPLATE_LANG') || 'en_US';
    const graphVersion = Deno.env.get('WHATSAPP_GRAPH_VERSION') || 'v23.0';
    if (!token || !phoneNumberId || !template) {
      await admin.from('payments').update({ whatsapp_status: 'not_configured' }).eq('id', paymentId);
      return new Response(JSON.stringify({ ok:false, notConfigured:true }), { status:200, headers:{...cors,'Content-Type':'application/json'} });
    }

    const normalized = String(customer.phone).replace(/\D/g,'');
    const phone = normalized.startsWith('91') ? normalized : `91${normalized}`;
    const schemeName = (customer as any).schemes?.name || 'Gold Savings';
    const nextDue = 'Please contact Nigar Gems & Jewellers for your next due date.';

    const body = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: template,
        language: { code: language },
        components: [{
          type: 'body',
          parameters: [
            { type:'text', text: customer.full_name },
            { type:'text', text: payment.receipt_no },
            { type:'text', text: `₹${Number(payment.amount).toLocaleString('en-IN')}` },
            { type:'text', text: schemeName },
            { type:'text', text: nextDue }
          ]
        }]
      }
    };

    const r = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method:'POST', headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify(body)
    });
    const result = await r.json();
    if (!r.ok) {
      await admin.from('payments').update({ whatsapp_status:'failed' }).eq('id', paymentId);
      return new Response(JSON.stringify({ok:false,error:result}), {status:400,headers:{...cors,'Content-Type':'application/json'}});
    }
    await admin.from('payments').update({ whatsapp_status:'sent' }).eq('id', paymentId);
    return new Response(JSON.stringify({ok:true,result}), {status:200,headers:{...cors,'Content-Type':'application/json'}});
  } catch (e) {
    return new Response(JSON.stringify({ok:false,error:String(e)}), {status:400,headers:{...cors,'Content-Type':'application/json'}});
  }
});
