import { http, passthrough } from 'msw'
import { ovhEuEndpoint } from '../const'

// Handlers used in any conditions
export const commonHandlers = [
  // Used to calculate a potentiel time drift between the client and the server
  http.get(`${ovhEuEndpoint}/auth/time`, () => passthrough())
]
