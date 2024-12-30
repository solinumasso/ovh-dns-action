import * as core from '@actions/core'
import ovh, { type DNSFieldType, type DNSRecord } from '@ovhcloud/node-ovh'

export const defaultFieldType = 'CNAME' as const
export const defaultTTL = 600 as const

export class OvhClient {
  private readonly client: ReturnType<typeof ovh>
  private readonly basePath: string

  constructor(
    private readonly applicationKey: string,
    private readonly applicationSecret: string,
    private readonly consumerKey: string,
    private readonly zone: string,
    private readonly endpoint?: string
  ) {
    try {
      this.client = ovh({
        endpoint: this.endpoint ?? 'ovh-eu',
        appKey: this.applicationKey,
        appSecret: this.applicationSecret,
        consumerKey: this.consumerKey
      })
    } catch (error) {
      core.error(`Error creating OVH client: ${error}`)
      throw new Error('Error creating OVH client', { cause: error })
    }
    // Base path to control DNS records
    // see https://eu.api.ovh.com/console/?section=%2Fdomain&branch=v1#get-/domain/zone/-zoneName-/record
    this.basePath = `/domain/zone/${this.zone}/record`
  }

  public async getSubDomainRecord(
    subDomain: string,
    fieldType?: DNSFieldType
  ): Promise<false | DNSRecord> {
    try {
      // Get subdomain ID
      const results = await this.client.requestPromised('GET', this.basePath, {
        fieldType,
        subDomain
      })
      if (!Array.isArray(results) || results.length === 0) {
        return false
      }
      // Get record from ID
      try {
        return (await this.client.requestPromised(
          'GET',
          `${this.basePath}/${results[0]}`
        )) as DNSRecord
      } catch (error) {
        if (
          typeof error === 'object' &&
          error &&
          'error' in error &&
          error.error === 404
        ) {
          core.error(`Record ${results[0]} not found`)
          return false
        }
        throw error
      }
    } catch (error) {
      core.error(`Error getting record ID: ${error}`)
      throw new Error('Error getting record ID', { cause: error })
    }
  }

  public async createSubDomainRecord(
    subDomain: string,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    try {
      return (await this.client.requestPromised('POST', this.basePath, {
        fieldType,
        ttl,
        subDomain,
        target
      })) as DNSRecord
    } catch (error) {
      core.error(`Error creating record: ${error}`)
      throw new Error('Error creating record', { cause: error })
    }
  }

  public async updateSubDomainRecord(
    subDomain: string,
    id: number,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    try {
      return (await this.client.requestPromised(
        'PUT',
        `${this.basePath}/${id}`,
        {
          fieldType,
          ttl,
          subDomain,
          target
        }
      )) as DNSRecord
    } catch (error) {
      core.error(`Error updating record: ${error}`)
      throw new Error('Error updating record', { cause: error })
    }
  }

  public async deleteSubDomainRecord(
    subDomain: string,
    fieldType: DNSFieldType = defaultFieldType
  ): Promise<void> {
    try {
      const record = await this.getSubDomainRecord(subDomain, fieldType)
      if (!record) {
        core.warning('No record found, nothing to delete')
        return
      }
      core.debug('Deleting record...')
      core.debug(JSON.stringify(record))
      await this.client.requestPromised(
        'DELETE',
        `${this.basePath}/${record.id}`
      )
    } catch (error) {
      core.error(`Error deleting record: ${error}`)
      throw new Error('Error deleting record', { cause: error })
    }
  }

  public async upsertSubDomainRecord(
    subDomain: string,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    const record = await this.getSubDomainRecord(subDomain, fieldType)
    if (!record) {
      core.debug('No record found, creating it...')
      return await this.createSubDomainRecord(subDomain, target, fieldType, ttl)
    }
    core.debug('Record found, updating it...')
    core.debug(JSON.stringify(record))
    return await this.updateSubDomainRecord(
      subDomain,
      record.id,
      target,
      fieldType,
      ttl
    )
  }
}

// const target = 'z1501eca1-z7507fa33-gtw.z318efa74.xms.sh.'

// setSubDomainRecord('api', target).then(result => {
//   console.log('Set result', result)
//   deleteSubDomainRecord('api').then(console.log)
// })
