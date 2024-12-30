import * as core from '@actions/core'

import { defaultFieldType, defaultTTL, OvhClient } from './ovh'
import { DNSFieldType } from '@ovhcloud/node-ovh'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // OVH client inputs
    const applicationKey: string = core.getInput('applicationKey', {
      required: true
    })
    core.setSecret(applicationKey)
    const applicationSecret: string = core.getInput('applicationSecret', {
      required: true
    })
    core.setSecret(applicationSecret)
    const consumerKey: string = core.getInput('consumerKey', { required: true })
    core.setSecret(consumerKey)
    const endpoint: string = core.getInput('endpoint')

    const zone: string = core.getInput('zone', { required: true })
    const subDomain: string = core.getInput('subDomain', { required: true })
    const present: boolean = core.getBooleanInput('present', { required: true })

    // Create an OVH client
    const client = new OvhClient(
      applicationKey,
      applicationSecret,
      consumerKey,
      zone,
      endpoint
    )

    if (present) {
      const target: string = core.getInput('target', { required: true })
      const rawTtl: string = core.getInput('ttl')
      const ttl = rawTtl.length ? parseInt(rawTtl, 10) : defaultTTL
      const rawFieldType: string = core.getInput('type')
      const fieldType: string = rawFieldType.length
        ? rawFieldType
        : defaultFieldType
      const record = await client.upsertSubDomainRecord(
        subDomain,
        target,
        fieldType as DNSFieldType,
        ttl
      )

      // Set outputs for other workflow steps to use
      core.setOutput('record', record)
    } else {
      await client.deleteSubDomainRecord(subDomain)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
