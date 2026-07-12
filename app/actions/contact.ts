'use server'

export async function sendContact(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Contact form is not configured yet.');
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}
