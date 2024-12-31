import { http, HttpResponse } from 'msw'

import { baseURL, dnsRecord, recordId } from './const'

export const updateOK = http.put(
  `${baseURL}/:recordId`,
  async ({ request, params }) => {
    // Construct a URL instance out of the intercepted request.
    const body = await request.json()
    const expectedId = recordId.toString()
    const receivedId = params['recordId']
    if (
      receivedId === expectedId &&
      typeof body === 'object' &&
      body &&
      body.fieldType === dnsRecord.fieldType &&
      body.subDomain === dnsRecord.subDomain &&
      body.target === dnsRecord.target &&
      body.ttl === dnsRecord.ttl
    ) {
      return HttpResponse.json(null, { status: 201 })
    }
    return HttpResponse.json({ message: 'Bad request' }, { status: 400 })
  }
)
