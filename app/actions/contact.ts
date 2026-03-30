'use server'

export async function sendContact(formData: FormData) {
  const email = formData.get('email');
  const message = formData.get('message');

  const res = await fetch('http://localhost:5678/webhook/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, message }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}
