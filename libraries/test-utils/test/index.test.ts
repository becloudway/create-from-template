import { getApiGatewayEventV2, getJWTAuthorizerRequestContext } from '../src';

describe('index.ts', () => {
  describe('getJWTAuthorizerRequestContext', () => {
    it('should provide empty claims and empty scopes by default', () => {
      expect(getJWTAuthorizerRequestContext()).toStrictEqual({
        principalId: 'principalId',
        integrationLatency: 100,
        jwt: { claims: {}, scopes: [] },
      });
    });

    it('should provide a JWT auth context with the provided claims', () => {
      const claims = { claim1: 'That good', claim2: 'My Dune' };
      expect(getJWTAuthorizerRequestContext({ claims })).toStrictEqual({
        principalId: 'principalId',
        integrationLatency: 100,
        jwt: { claims, scopes: [] },
      });
    });

    it('should provide a JWT auth context with the provided scopes', () => {
      const scopes = ['Dune', 'Precious'];
      expect(getJWTAuthorizerRequestContext({ scopes })).toStrictEqual({
        principalId: 'principalId',
        integrationLatency: 100,
        jwt: { claims: {}, scopes },
      });
    });

    it('should provide a JWT auth context with the provided claims and scopes', () => {
      const claims = { claim1: 'That good', claim2: 'My Dune' };
      const scopes = ['Dune', 'Precious'];
      expect(getJWTAuthorizerRequestContext({ claims, scopes })).toStrictEqual({
        principalId: 'principalId',
        integrationLatency: 100,
        jwt: { claims, scopes },
      });
    });
  });

  describe('getApiGatewayEventV2', () => {
    it('should provide a default request with the minimum amount of information necessary', () => {
      const method = 'GET';
      const path = '/some/perfect/path';
      expect(getApiGatewayEventV2({ method, path })).toStrictEqual({
        version: '2.0',
        routeKey: '$default',
        rawPath: path,
        rawQueryString: '',
        cookies: undefined,
        headers: {},
        queryStringParameters: undefined,
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
          authorizer: getJWTAuthorizerRequestContext(),
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
        body: undefined,
        pathParameters: undefined,
        isBase64Encoded: false,
        stageVariables: undefined,
      });
    });

    it('should provide a complete request with all options', () => {
      const method = 'POST';
      const path = '/some/perfect/path';
      const body = JSON.stringify({ foo: 'bar' });
      const pathParameters = { perfect: 'path' };
      const queryStringParameters = { from: 'now', to: 'later' };
      const jwtAuthorizer = getJWTAuthorizerRequestContext({
        claims: { claim1: 'That good', claim2: 'My Dune' },
        scopes: ['Dune', 'Precious'],
      });
      const headers = { 'Content-Type': 'application/json' };
      const cookies = ['cookie', 'monster'];
      const stageVariables = { stage: 'testing, obviously' };
      expect(
        getApiGatewayEventV2({
          method,
          path,
          body,
          pathParameters,
          queryStringParameters,
          jwtAuthorizer,
          headers,
          cookies,
          stageVariables,
        }),
      ).toStrictEqual({
        version: '2.0',
        routeKey: '$default',
        rawPath: path,
        rawQueryString: `from=now&to=later`,
        cookies,
        headers,
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
          authorizer: jwtAuthorizer,
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
    });
  });
});
