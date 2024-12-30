import { http, HttpResponse } from 'msw'

import { baseURL, recordId, dnsRecord } from './const'

export const getFound = http.get(`${baseURL}/${recordId}`, () =>
  HttpResponse.json(dnsRecord)
)

export const getNotFound = http.get(`${baseURL}/:recordId`, () =>
  HttpResponse.json(
    {
      class: 'Client::NotFound',
      message: 'Record does not exist'
    },
    { status: 404 }
  )
)
