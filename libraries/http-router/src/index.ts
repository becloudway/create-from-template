import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import middyErrorHandler from '@middy/http-error-handler';
import middyHeaderNormalizer, { Event as headerNormalizedEvent } from '@middy/http-header-normalizer';
import middyJSONBodyParser, { Event as jsonBodyParserEvent } from '@middy/http-json-body-parser';
import middyResponseSerializer from '@middy/http-response-serializer';
import middyRouterHandler, { Route as MiddyRoute, Method as HTTPMethod } from '@middy/http-router';

export type Event = APIGatewayEvent & headerNormalizedEvent & jsonBodyParserEvent;

export type MiddlewareFnRequest = {
  event: Event;
  response: APIGatewayProxyResult | null;
  error: Error | null;
};

export type Middleware = {
  before?: (request: MiddlewareFnRequest) => void;
  after?: (request: MiddlewareFnRequest) => void;
  onError?: (request: MiddlewareFnRequest) => void;
};

export type Route = {
  handler: (
    event: Event,
    context?: Context,
  ) => Omit<APIGatewayProxyResult, 'body'> & { body: Record<string, any> | string };
  middleware?: Middleware[] | Middleware;
} & Omit<MiddyRoute<Event>, 'handler'>;

export type Router = {
  use: (middlewares: Middleware[] | Middleware) => Router;
  handler: () => (event: Event, context: Context) => APIGatewayProxyResult;
};

const convertRoutesToMiddy = (routes: Route[], prefix: string) =>
  routes.map(
    (route: Route): MiddyRoute<Event> => ({
      ...route,
      path: prefix === '$default' ? route.path : `/${prefix}${route.path}`,
      handler: middy()
        .use(route.middleware || [])
        .handler((event: unknown) => route.handler(event as unknown as Event) as unknown as any),
    }),
  );

const defaultMiddlewares = [
  middyHeaderNormalizer(),
  middyJSONBodyParser(),
  middyErrorHandler(),
  middyResponseSerializer({
    serializers: [
      {
        regex: /^application\/json$/,
        serializer: ({ body }) => body && JSON.stringify(body),
      },
    ],
    defaultContentType: 'application/json',
  }),
] as Middleware[];

export const Methods: Record<string, HTTPMethod> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  ANY: 'ANY',
};

export const createRouter = (routes: Route[], prefix = '$default'): Router => {
  let middyHolder = middy();
  const handler = (): ((event: Event, context?: Context) => APIGatewayProxyResult) =>
    middyHolder.handler(middyRouterHandler(convertRoutesToMiddy(routes, prefix))) as unknown as any;
  const use = (middlewares: Middleware[] | Middleware) => {
    middyHolder = middyHolder.use(middlewares) as unknown as any;
    return {
      use,
      handler,
    };
  };
  return use(defaultMiddlewares);
};
