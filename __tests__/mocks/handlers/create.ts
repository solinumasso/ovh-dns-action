import { http, HttpResponse } from 'msw'

import { baseURL, dnsRecord } from '../const'

export const createOK = http.post(baseURL, async ({ request }) => {
  // Construct a URL instance out of the intercepted request.
  const body = await request.json()
  if (
    typeof body === 'object' &&
    body &&
    body.fieldType === dnsRecord.fieldType &&
    body.subDomain === dnsRecord.subDomain &&
    body.target === dnsRecord.target &&
    body.ttl === dnsRecord.ttl
  ) {
    return HttpResponse.json({ ...dnsRecord }, { status: 201 })
  }
  return HttpResponse.json({ message: 'Bad request' }, { status: 400 })
})
