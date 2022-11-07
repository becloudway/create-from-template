import { Context } from 'aws-lambda';
import { Event, Route, Methods, createRouter } from '@cloudway-template/http-router';
import createError from 'http-errors';

const { API_STAGENAME } = process.env;

const routes = (): Route[] => [
  {
    method: Methods.GET,
    path: '/item/{id}',
    handler: (event: Event) => {
      return { statusCode: 200, body: { id: event.pathParameters?.id } };
    },
  },
  {
    method: Methods.GET,
    path: '/error/badrequest',
    handler: () => {
      return { statusCode: 200, body: { foo: 'bar' } };
    },
    middleware: {
      before: () => {
        throw new createError.BadRequest();
      },
    },
  },
];

export const handler = async (event: Event, context: Context) => {
  // Initialize dependencies for injection
  // Run the request
  return createRouter(routes(), API_STAGENAME).handler()(event, context);
};
