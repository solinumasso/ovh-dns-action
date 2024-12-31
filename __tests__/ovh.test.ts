/**
 * Unit tests for src/ovh.ts
 */

import { expect } from '@jest/globals'
import { setupServer } from 'msw/node'

import { OvhClient } from '../src/ovh'

import { getFound, getNotFound } from './mocks/handlers/get'
import { listFound, listNotFound } from './mocks/handlers/list'
import { commonHandlers } from './mocks/handlers/common'
import { dnsRecord, recordId, subdomain, zone } from './mocks/const'
import { createOK } from './mocks/handlers/create'
import { updateOK } from './mocks/handlers/update'
import { deleteOK } from './mocks/handlers/delete'

describe('ovh.ts OvhClient', () => {
  let client: OvhClient
  let server: ReturnType<typeof setupServer>

  beforeAll(() => {
    server = setupServer(...commonHandlers)
  })

  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
    client = new OvhClient('appKey', 'appSecret', 'consumerKey', zone)
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  it('getSubdomainRecord returns false if no record found', async () => {
    server.use(listNotFound, getFound)
    const result = await client.getSubdomainRecord(subdomain)
    expect(result).toBe(false)
  })

  // This test is probably a bit overkill but who knows?
  it('getSubdomainRecord returns false if no record found for record ID', async () => {
    server.use(listFound, getNotFound)
    const result = await client.getSubdomainRecord(subdomain)
    expect(result).toBe(false)
  })

  it('getSubdomainRecord returns false if no record found, with fieldType', async () => {
    server.use(listNotFound, getFound)
    const result = await client.getSubdomainRecord(subdomain, 'CNAME')
    expect(result).toBe(false)
  })

  it('getSubdomainRecord returns record if found', async () => {
    server.use(listFound, getFound)
    const result = await client.getSubdomainRecord(subdomain)
    expect(result).toEqual(dnsRecord)
  })

  it('getSubdomainRecord returns record if found, with fieldType', async () => {
    server.use(listFound, getFound)
    const result = await client.getSubdomainRecord(subdomain, 'CNAME')
    expect(result).toEqual(dnsRecord)
  })

  it('createSubdomainRecord creates a new record', async () => {
    server.use(createOK)
    const result = await client.createSubdomainRecord(
      dnsRecord.subDomain,
      dnsRecord.target
    )
    expect(result).toEqual(dnsRecord)
  })

  it('createSubdomainRecord creates a new record, with fieldType and TTL', async () => {
    server.use(createOK)
    const result = await client.createSubdomainRecord(
      dnsRecord.subDomain,
      dnsRecord.target,
      'CNAME',
      600
    )
    expect(result).toEqual(dnsRecord)
  })

  it('updateSubdomainRecord updates an existing record', async () => {
    server.use(getFound, updateOK)
    const result = await client.updateSubdomainRecord(
      dnsRecord.subDomain,
      recordId,
      dnsRecord.target
    )
    expect(result).toEqual(dnsRecord)
  })

  it('deleteSubdomainRecord deletes an existing record', async () => {
    server.use(listFound, getFound, deleteOK)
    await client.deleteSubdomainRecord(dnsRecord.subDomain)
  })

  it('deleteSubdomainRecord deletes a non-existing record', async () => {
    server.use(listNotFound)
    await client.deleteSubdomainRecord(dnsRecord.subDomain)
  })

  it('upsertSubdomainRecord creates a new record if none exists', async () => {
    server.use(listNotFound, createOK)
    const result = await client.upsertSubdomainRecord(
      dnsRecord.subDomain,
      dnsRecord.target
    )
    expect(result).toEqual(dnsRecord)
  })

  it('upsertSubdomainRecord updates an existing record if found', async () => {
    server.use(listFound, getFound, updateOK)
    const result = await client.upsertSubdomainRecord(
      dnsRecord.subDomain,
      dnsRecord.target
    )
    expect(result).toEqual(dnsRecord)
  })
})
