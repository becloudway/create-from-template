import { APIGatewayEvent, Context } from 'aws-lambda';
import createAPI from 'lambda-api';

// instantiate api routing framework
const api = createAPI();

api.get('/item/:id', async (req) => {
  return { id: req.params.id, foo: 'bar' };
});

export const handler = async (event: APIGatewayEvent, context: Context) => {
  // Run the request
  return api.run(event, context);
};
