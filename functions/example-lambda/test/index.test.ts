import { Context } from 'aws-lambda';
import { getApiGatewayEventV2 } from '@cloudway-template/test-utils';
import { Methods, Event } from '@cloudway-template/http-router';
import { handler } from '../src/index';

describe('index.ts', () => {
  it('should route the incoming event appropriately', async () => {
    const event = getApiGatewayEventV2({ method: Methods.GET, path: '/item/5' });

    await expect(handler(event as unknown as Event, {} as Context)).resolves.toStrictEqual({
      body: JSON.stringify({ id: '5' }),
      headers: { 'Content-Type': 'application/json' },
      statusCode: 200,
    });
  });
});
