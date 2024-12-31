import { http, HttpResponse } from 'msw'

import { baseURL, recordId, subdomain as expectedSubdomain } from '../const'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getList = (result: number[]) =>
  http.get(baseURL, ({ request }) => {
    // Construct a URL instance out of the intercepted request.
    const url = new URL(request.url)
    const fieldType = url.searchParams.get('fieldType')
    const subdomain = url.searchParams.get('subDomain')
    if (
      (!fieldType || fieldType === 'CNAME') &&
      subdomain === expectedSubdomain
    ) {
      return HttpResponse.json(result)
    }
    return HttpResponse.json({ message: 'Bad request' }, { status: 400 })
  })

export const listNotFound = getList([])

export const listFound = getList([recordId, 4315996787])
