import * as core from '@actions/core'
import ovh, { type DNSFieldType, type DNSRecord } from '@ovhcloud/node-ovh'

export const defaultFieldType = 'CNAME'
export const defaultTTL = 600

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
        endpoint: this.endpoint?.length ? this.endpoint : 'ovh-eu',
        appKey: this.applicationKey,
        appSecret: this.applicationSecret,
        consumerKey: this.consumerKey
      })
    } catch (error) {
      core.error(`Error creating OVH client: ${JSON.stringify(error)}`)
      throw new Error('Error creating OVH client', { cause: error })
    }
    // Base path to control DNS records
    // see https://eu.api.ovh.com/console/?section=%2Fdomain&branch=v1#get-/domain/zone/-zoneName-/record
    this.basePath = `/domain/zone/${this.zone}/record`
  }

  async getSubdomainRecordFromId(id: number): Promise<false | DNSRecord> {
    try {
      return (await this.client.requestPromised(
        'GET',
        `${this.basePath}/${id}`
      )) as DNSRecord
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'error' in error &&
        error.error === 404
      ) {
        core.error(`Record ${id} not found`)
        return false
      }
      core.error(`Error getting record: ${JSON.stringify(error)}`)
      throw new Error('Error getting record', { cause: error })
    }
  }

  async getSubdomainRecord(
    subdomain: string,
    fieldType?: DNSFieldType
  ): Promise<false | DNSRecord> {
    try {
      const results = await this.client.requestPromised('GET', this.basePath, {
        fieldType,
        subDomain: subdomain
      })
      if (
        !Array.isArray(results) ||
        results.length === 0 ||
        typeof results[0] !== 'number'
      ) {
        return false
      }
      return await this.getSubdomainRecordFromId(results[0])
    } catch (error) {
      core.error(`Error getting record ID: ${JSON.stringify(error)}`)
      throw new Error('Error getting record ID', { cause: error })
    }
  }

  async createSubdomainRecord(
    subdomain: string,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    try {
      return (await this.client.requestPromised('POST', this.basePath, {
        fieldType,
        ttl,
        subDomain: subdomain,
        target
      })) as DNSRecord
    } catch (error) {
      core.error(`Error creating record: ${JSON.stringify(error)}`)
      throw new Error('Error creating record', { cause: error })
    }
  }

  async updateSubdomainRecord(
    subdomain: string,
    id: number,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    try {
      await this.client.requestPromised('PUT', `${this.basePath}/${id}`, {
        fieldType,
        ttl,
        subDomain: subdomain,
        target
      })
    } catch (error) {
      core.error(`Error updating record: ${JSON.stringify(error)}`)
      throw new Error('Error updating record', { cause: error })
    }
    const record = await this.getSubdomainRecordFromId(id)
    if (!record) {
      throw new Error('Error updating record', {
        cause: new Error('Record not found after update')
      })
    }
    return record
  }

  async deleteSubdomainRecord(
    subdomain: string,
    fieldType: DNSFieldType = defaultFieldType
  ): Promise<void> {
    try {
      const record = await this.getSubdomainRecord(subdomain, fieldType)
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
      core.error(`Error deleting record: ${JSON.stringify(error)}`)
      throw new Error('Error deleting record', { cause: error })
    }
  }

  async upsertSubdomainRecord(
    subdomain: string,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    const record = await this.getSubdomainRecord(subdomain, fieldType)
    if (!record) {
      core.debug('No record found, creating it...')
      return await this.createSubdomainRecord(subdomain, target, fieldType, ttl)
    }
    core.debug('Record found, updating it...')
    core.debug(JSON.stringify(record))
    return await this.updateSubdomainRecord(
      subdomain,
      record.id,
      target,
      fieldType,
      ttl
    )
  }
}
