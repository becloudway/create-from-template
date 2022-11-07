import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayEventRequestContextJWTAuthorizer } from 'aws-lambda';

import { encode as encodeAsQueryString } from 'querystring';

export const getJWTAuthorizerRequestContext = ({
  claims,
  scopes,
}: {
  claims?: {
    [name: string]: string | number | boolean | string[];
  };
  scopes?: string[];
} = {}): APIGatewayEventRequestContextJWTAuthorizer => ({
  principalId: 'principalId',
  integrationLatency: 100,
  jwt: {
    claims: claims ?? {},
    scopes: scopes ?? [],
  },
});

export const getApiGatewayEventV2 = ({
  method,
  path,
  body,
  pathParameters,
  queryStringParameters,
  jwtAuthorizer,
  headers,
  cookies,
  stageVariables,
}: {
  method: string;
  path: string;
  body?: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  jwtAuthorizer?: APIGatewayEventRequestContextJWTAuthorizer;
  headers?: Record<string, string>;
  cookies?: string[];
  stageVariables?: Record<string, string>;
}): APIGatewayProxyEventV2WithJWTAuthorizer => ({
  version: '2.0',
  routeKey: '$default',
  rawPath: path,
  rawQueryString: encodeAsQueryString(queryStringParameters),
  cookies,
  headers: headers ?? {},
  queryStringParameters,
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    authentication: {
      clientCert: {
        clientCertPem: 'CERT_CONTENT',
        subjectDN: 'www.example.com',
        issuerDN: 'Example issuer',
        serialNumber: 'a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1',
        validity: {
          notBefore: 'May 28 12:30:02 2019 GMT',
          notAfter: 'Aug  5 09:36:04 2021 GMT',
        },
      },
    },
    authorizer: jwtAuthorizer ?? getJWTAuthorizerRequestContext(),
    domainName: 'id.execute-api.us-east-1.amazonaws.com',
    domainPrefix: 'id',
    http: {
      method,
      path,
      protocol: 'HTTP/1.1',
      sourceIp: '192.168.0.1/32',
      userAgent: 'agent',
    },
    requestId: 'id',
    routeKey: '$default',
    stage: '$default',
    time: '12/Mar/2020:19:03:58 +0000',
    timeEpoch: 1583348638390,
  },
  body,
  pathParameters,
  isBase64Encoded: false,
  stageVariables,
});
