import { apiCall } from './apicall';

export function generateIllustration(prompt: string, token: string): Promise<{ imageUrl: string }> {
  return apiCall('/illustrations/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  }) as Promise<{ imageUrl: string }>;
}
