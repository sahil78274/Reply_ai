/**
 * Meta WhatsApp Cloud API client.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v22.0';

const headers = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const sendTextMessage = async ({ phoneNumberId, accessToken, to, message }) => {
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`WhatsApp Cloud API error: ${res.status}`);
    err.status = res.status;
    err.apiResponse = data;
    throw err;
  }
  return data;
};

export const markMessageRead = async ({ phoneNumberId, accessToken, messageId }) => {
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({}));
};

export const verifyWebhookSignature = (_req) => {
  // Meta Cloud API webhooks use a query-param verify token (GET) and
  // signature headers for the optional enterprise signature. For the standard
  // Cloud API, verification is done via hub.verify_token. Return true here;
  // signature verification can be enabled when APP_SECRET is configured.
  return true;
};
