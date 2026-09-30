# WhatsApp Cloud API setup

1. Create/configure a Meta WhatsApp Business Cloud API app and phone number.
2. Create an approved WhatsApp message template for payment confirmations. Example variables:
   1 = customer name
   2 = receipt number
   3 = payment amount
   4 = total paid
   5 = scheme name
   6 = next due date
3. Deploy the Edge Function:
   `supabase functions deploy send-whatsapp`
4. Add secrets in Supabase:
   - WHATSAPP_TOKEN = your Meta permanent/system-user access token
   - WHATSAPP_PHONE_NUMBER_ID = your WhatsApp Cloud API phone number ID
   - WHATSAPP_TEMPLATE_NAME = your approved template name
   - WHATSAPP_TEMPLATE_LANG = e.g. en_US
   - WHATSAPP_GRAPH_VERSION = current Graph API version supported by your Meta app (optional; defaults to v23.0 in this project)
5. The app invokes the function after a successful payment. If the function is not configured, the app still offers a WhatsApp click-to-chat button.

Do not put the Meta token in config.js or any browser code.
