export const ovhEuEndpoint = 'https://eu.api.ovh.com/1.0'
export const zone = 'foo.bar'
export const baseURL = `${ovhEuEndpoint}/domain/zone/${zone}/record`

export const recordId = 5115496087
export const subdomain = 'www'
export const dnsRecord = Object.freeze({
  id: recordId,
  fieldType: 'CNAME',
  subDomain: subdomain,
  target: 'foo.baz.',
  ttl: 600
})
