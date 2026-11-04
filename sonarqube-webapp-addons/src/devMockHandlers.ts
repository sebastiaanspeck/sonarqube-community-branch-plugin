import { HttpHandler } from 'msw';

/**
 * Extra MSW handlers used by the dev mock API (`WITH_MOCK_API=true`). This plugin has no
 * addon-specific endpoints to mock, so it contributes none.
 */
export function getDevMockHandlers(): HttpHandler[] {
  return [];
}
