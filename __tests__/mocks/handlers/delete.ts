import { http, HttpResponse } from 'msw'

import { baseURL, recordId } from '../const'

export const deleteOK = http.delete(`${baseURL}/${recordId}`, () =>
  HttpResponse.json(null)
)
