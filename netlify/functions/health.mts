const json = (body: unknown, status: number, headers: Record<string, string>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

export default async (req: Request) => {
  const origin = req.headers.get('origin')
  return json({ status: 'ok', service: 'pio-backend' }, 200, origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {})
}

export const config = {
  path: '/api/health',
  method: 'GET',
}
