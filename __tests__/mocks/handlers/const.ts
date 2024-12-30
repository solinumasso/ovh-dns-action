export const ovhEuEndpoint = 'https://eu.api.ovh.com/1.0' as const
export const zone = 'foo.bar' as const
export const baseURL = `${ovhEuEndpoint}/domain/zone/${zone}/record` as const

export const recordId = 5115496087 as const
export const subDomain = 'www' as const
export const dnsRecord = Object.freeze({
  id: recordId,
  fieldType: 'CNAME',
  subDomain,
  target: 'foo.baz.',
  ttl: 600
})
