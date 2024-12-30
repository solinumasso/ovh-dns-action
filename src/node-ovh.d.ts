declare module '@ovhcloud/node-ovh' {
  type DNSFieldType =
    | 'A'
    | 'AAAA'
    | 'CAA'
    | 'CNAME'
    | 'DKIM'
    | 'DMARC'
    | 'DNAME'
    | 'LOC'
    | 'MX'
    | 'NAPTR'
    | 'NS'
    | 'PTR'
    | 'SPF'
    | 'SRV'
    | 'SSHFP'
    | 'TLSA'
    | 'TXT'
  interface DNSRecord {
    id: number
    fieldType: DNSFieldType
    subDomain?: string | null
    target: string
    ttl?: number | null
    zone: string
  }

  export default function (options: {
    endpoint: string
    appKey: string
    appSecret: string
    consumerKey: string
  }): {
    requestPromised(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      body?: Record<string, unknown>
    ): Promise<unknown>
  }
}
