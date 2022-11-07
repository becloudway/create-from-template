import { getApiGatewayEventV2 } from '@cloudway-template/test-utils';
import { Context } from 'aws-lambda';
import sinon from 'sinon';
import createErrors from 'http-errors';

import { createRouter, Methods, Route, Event, Middleware } from '../src';

describe('index.ts', () => {
  let routes: Record<string, Route>;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    routes = {
      testGet: {
        method: Methods.GET,
        path: '/test/get',
        handler: sandbox.stub().returns({ statusCode: 200, body: { foo: 'bar' } }),
      },
      testPost: {
        method: Methods.POST,
        path: '/test/post',
        handler: sandbox.stub().returns({ statusCode: 201 }),
      },
      testError: {
        method: Methods.GET,
        path: '/test/badrequest',
        handler: sandbox.stub().throws(new createErrors.BadRequest()),
      },
      testMiddleware: {
        method: Methods.GET,
        path: '/test/middleware',
        handler: sandbox.stub().returns({ statusCode: 200, body: { foo: 'bar' } }),
        middleware: {
          before: sandbox.stub(),
        },
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
    routes = {};
  });

  it('should create a router call the function for the corresponding path when executing the handler - testGet', async () => {
    const { handler } = createRouter(Object.values(routes));
    const testGetEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/get' });
    const result = await handler()(testGetEvent as unknown as Event, {} as unknown as Context);
    expect(result).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify({ foo: 'bar' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(routes.testGet.handler).toHaveBeenCalledTimes(1);
    expect(routes.testGet.handler).toHaveBeenCalledWith(testGetEvent);
  });

  it('should create a router call the function for the corresponding path when executing the handler - testPost', async () => {
    const { handler } = createRouter(Object.values(routes));
    const testPostEvent = getApiGatewayEventV2({ method: 'POST', path: '/test/post' });
    const result = await handler()(testPostEvent as unknown as Event, {} as unknown as Context);
    expect(result).toStrictEqual({
      statusCode: 201,
      body: undefined,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(routes.testPost.handler).toHaveBeenCalledTimes(1);
    expect(routes.testPost.handler).toHaveBeenCalledWith(testPostEvent);
  });

  it('should create a router call the function for the corresponding path when executing the handler - testError', async () => {
    const { handler } = createRouter(Object.values(routes));
    const testErrorEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/badrequest' });
    const result = await handler()(testErrorEvent as unknown as Event, {} as unknown as Context);
    expect(result).toStrictEqual({
      statusCode: 400,
      body: 'Bad Request',
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(routes.testError.handler).toHaveBeenCalledTimes(1);
    expect(routes.testError.handler).toHaveBeenCalledWith(testErrorEvent);
  });

  describe('prefix', () => {
    it('should not prefix the paths with a $default prefix', async () => {
      const { handler } = createRouter(Object.values(routes), '$default');
      const testGetEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/get' });
      const result = await handler()(testGetEvent as unknown as Event, {} as unknown as Context);
      expect(result).toStrictEqual({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(routes.testGet.handler).toHaveBeenCalledTimes(1);
      expect(routes.testGet.handler).toHaveBeenCalledWith(testGetEvent);
    });

    it('should prefix the paths with a non-$default prefix', async () => {
      const { handler } = createRouter(Object.values(routes), 'api');
      const testGetEvent = getApiGatewayEventV2({ method: 'GET', path: '/api/test/get' });
      const result = await handler()(testGetEvent as unknown as Event, {} as unknown as Context);
      expect(result).toStrictEqual({
        statusCode: 200,
        body: JSON.stringify({ foo: 'bar' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(routes.testGet.handler).toHaveBeenCalledTimes(1);
      expect(routes.testGet.handler).toHaveBeenCalledWith(testGetEvent);
    });
  });

  describe('JSON body parser & Header normalizer', () => {
    it('should normalize the headers', async () => {
      const { handler } = createRouter(Object.values(routes));
      const headers = { 'Content-Type': 'text/plain', 'Content-Length': '0' };
      const testPostEvent = getApiGatewayEventV2({
        method: 'POST',
        path: '/test/post',
        body: 'First time I kissed a boy',
        headers,
      });
      const result = await handler()({ ...testPostEvent } as unknown as Event, {} as unknown as Context);
      expect(result).toStrictEqual({
        statusCode: 201,
        body: undefined,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(routes.testPost.handler).toHaveBeenCalledTimes(1);
      expect(routes.testPost.handler).toHaveBeenCalledWith({
        ...testPostEvent,
        headers: { 'content-type': headers['Content-Type'], 'content-length': headers['Content-Length'] },
        rawHeaders: headers,
      });
    });

    it('should normalize the headers & parse the body if it is a JSON Content-Type', async () => {
      const { handler } = createRouter(Object.values(routes));
      const body = JSON.stringify({ foo: 'bar' });
      const headers = { 'Content-Type': 'application/json' };
      const testPostEvent = getApiGatewayEventV2({
        method: 'POST',
        path: '/test/post',
        body,
        headers,
      });
      const result = await handler()({ ...testPostEvent } as unknown as Event, {} as unknown as Context);
      expect(result).toStrictEqual({
        statusCode: 201,
        body: undefined,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(routes.testPost.handler).toHaveBeenCalledTimes(1);
      expect(routes.testPost.handler).toHaveBeenCalledWith({
        ...testPostEvent,
        body: JSON.parse(body),
        rawBody: body,
        headers: { 'content-type': headers['Content-Type'] },
        rawHeaders: headers,
      });
    });
  });

  describe('middlewares', () => {
    describe('general middleware', () => {
      it('should call the before general middleware', async () => {
        let storedReq;
        const before = sandbox.stub().callsFake((req) => {
          storedReq = { ...req };
        });
        const { handler } = createRouter(Object.values(routes)).use({
          before,
        });
        const testGetEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/get' });
        const result = await handler()(testGetEvent as unknown as Event, {} as unknown as Context);
        expect(result).toStrictEqual({
          statusCode: 200,
          body: JSON.stringify({ foo: 'bar' }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(routes.testGet.handler).toHaveBeenCalledTimes(1);
        expect(routes.testGet.handler).toHaveBeenCalledWith(testGetEvent);
        expect(before).toHaveBeenCalledTimes(1);
        expect(storedReq).toStrictEqual({
          event: testGetEvent,
          context: {},
          internal: {},
          response: undefined,
          error: undefined,
        });
      });

      it('should call the after general middleware', async () => {
        let storedReq;
        const after = sandbox.stub().callsFake((req) => {
          storedReq = { ...req };
        });
        const { handler } = createRouter(Object.values(routes)).use({
          after,
        });
        const testGetEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/get' });
        const result = await handler()(testGetEvent as unknown as Event, {} as unknown as Context);
        const response = {
          statusCode: 200,
          body: JSON.stringify({ foo: 'bar' }),
          headers: { 'Content-Type': 'application/json' },
        };
        expect(result).toStrictEqual(response);
        expect(routes.testGet.handler).toHaveBeenCalledTimes(1);
        expect(routes.testGet.handler).toHaveBeenCalledWith(testGetEvent);
        expect(after).toHaveBeenCalledTimes(1);
        expect(storedReq).toStrictEqual({
          event: testGetEvent,
          context: {},
          internal: {},
          response,
          error: undefined,
        });
      });

      it('should call the onError general middleware', async () => {
        let storedReq;
        const onError = sandbox.stub().callsFake((req) => {
          storedReq = { ...req };
        });
        const { handler } = createRouter(Object.values(routes)).use({
          onError,
        });
        const testErrorEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/badrequest' });
        const result = await handler()(testErrorEvent as unknown as Event, {} as unknown as Context);
        const response = {
          statusCode: 400,
          body: 'Bad Request',
          headers: { 'Content-Type': 'text/plain' },
        };
        expect(result).toStrictEqual(response);
        expect(routes.testError.handler).toHaveBeenCalledTimes(1);
        expect(routes.testError.handler).toHaveBeenCalledWith(testErrorEvent);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(storedReq).toStrictEqual({
          event: testErrorEvent,
          context: {},
          internal: {},
          response: undefined,
          error: new createErrors.BadRequest(),
        });
      });
    });

    describe('route specific middleware', () => {
      it('should call the route specific middleware only for that route', async () => {
        const { handler } = createRouter(Object.values(routes));
        const testMiddlewareEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/middleware' });
        const result = await handler()(testMiddlewareEvent as unknown as Event, {} as unknown as Context);
        expect(result).toStrictEqual({
          statusCode: 200,
          body: JSON.stringify({ foo: 'bar' }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(routes.testMiddleware.handler).toHaveBeenCalledTimes(1);
        expect(routes.testMiddleware.handler).toHaveBeenCalledWith(testMiddlewareEvent);
        expect((routes.testMiddleware.middleware as Middleware).before).toHaveBeenCalledTimes(1);
      });

      it('should not call the route specific middleware for another route', async () => {
        const { handler } = createRouter(Object.values(routes));
        const testGetEvent = getApiGatewayEventV2({ method: 'GET', path: '/test/get' });
        const result = await handler()(testGetEvent as unknown as Event, {} as unknown as Context);
        expect(result).toStrictEqual({
          statusCode: 200,
          body: JSON.stringify({ foo: 'bar' }),
          headers: { 'Content-Type': 'application/json' },
        });
        expect(routes.testGet.handler).toHaveBeenCalledTimes(1);
        expect(routes.testGet.handler).toHaveBeenCalledWith(testGetEvent);
        expect((routes.testMiddleware.middleware as Middleware).before).toHaveBeenCalledTimes(0);
      });
    });
  });
});
