/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import { setupServer } from 'msw/node'

import * as main from '../src/main'

import { dnsRecord, subdomain, zone } from './mocks/const'
import { commonHandlers } from './mocks/handlers/common'
import { listFound, listNotFound } from './mocks/handlers/list'
import { getFound } from './mocks/handlers/get'
import { deleteOK } from './mocks/handlers/delete'
import { updateOK } from './mocks/handlers/update'
import { createOK } from './mocks/handlers/create'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let getBooleanInputMock: jest.SpiedFunction<typeof core.getBooleanInput>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
jest.spyOn(core, 'setSecret').mockImplementation()
jest.spyOn(core, 'debug').mockImplementation()

describe('action', () => {
  let server: ReturnType<typeof setupServer>

  beforeAll(() => {
    server = setupServer(...commonHandlers)
  })

  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })

    jest.clearAllMocks()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    getBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
    jest.restoreAllMocks()
  })

  it('delete the record', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'application-key':
          return 'appKey'
        case 'application-secret':
          return 'appSecret'
        case 'consumer-key':
          return 'consumerKey'
        case 'zone':
          return zone
        case 'subdomain':
          return subdomain
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation(name => {
      switch (name) {
        case 'present':
          return false
        default:
          return false
      }
    })

    server.use(listFound, getFound, deleteOK)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setOutputMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('update the record', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'application-key':
          return 'appKey'
        case 'application-secret':
          return 'appSecret'
        case 'consumer-key':
          return 'consumerKey'
        case 'zone':
          return zone
        case 'subdomain':
          return subdomain
        case 'target':
          return dnsRecord.target
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation(name => {
      switch (name) {
        case 'present':
          return true
        default:
          return false
      }
    })

    server.use(listFound, getFound, updateOK)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'record',
      JSON.stringify(dnsRecord)
    )
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('create the record', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'application-key':
          return 'appKey'
        case 'application-secret':
          return 'appSecret'
        case 'consumer-key':
          return 'consumerKey'
        case 'zone':
          return zone
        case 'subdomain':
          return subdomain
        case 'target':
          return dnsRecord.target
        default:
          return ''
      }
    })
    getBooleanInputMock.mockImplementation(name => {
      switch (name) {
        case 'present':
          return true
        default:
          return false
      }
    })

    server.use(listNotFound, createOK)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'record',
      JSON.stringify(dnsRecord)
    )
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(() => '') // No inputs
    getBooleanInputMock.mockImplementation(() => false)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenCalled()
  })
})
