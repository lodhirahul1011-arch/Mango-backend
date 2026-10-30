import pio from '../../backend-integration/pio/contact.cjs'

const { validate, createMailer } = pio

const corsHeaders = (req: Request, methods: string) => {
  const origin = req.headers.get('origin')
  return {
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

export default async function contact(req: Request) {
  const headers = corsHeaders(req, 'POST,OPTIONS')
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (req.method !== 'POST') return json({ message: 'Endpoint not found' }, 404, headers)

  const raw = await req.text()
  if (raw.length > 12 * 1024) return json({ message: 'Invalid request body.' }, 413, headers)
  let body
  try { body = JSON.parse(raw) } catch { return json({ message: 'Invalid request body.' }, 400, headers) }

  let data
  try { data = validate(body) } catch (error: any) {
    return json({ message: 'Please check your name, phone, email and enquiry details.', errors: error.errors || {} }, 400, headers)
  }
  try {
    await createMailer().send(data)
    console.info('[PIO contact] Mail provider accepted enquiry')
    return json({ emailStatus: 'accepted' }, 200, headers)
  } catch (error: any) {
    console.error('[PIO contact] Delivery failed', {
      category: ['configuration', 'provider'].includes(error.message) ? error.message : error.name === 'TimeoutError' ? 'timeout' : 'transport',
      providerStatus: Number.isInteger(error.providerStatus) ? error.providerStatus : undefined,
      providerDetail: error.message === 'provider' ? error.providerDetail : undefined,
    })
    return json({ emailStatus: 'failed', message: 'Email service unavailable. Please try again or call our helpline.' }, 503, headers)
  }
}

export const config = {
  path: '/api/pio/contact',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
}
