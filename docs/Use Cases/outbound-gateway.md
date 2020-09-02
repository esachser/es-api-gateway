# Outbound Gateway

## Why?

It's a good practice to limit the outbound traffic to a single cluster with that responsability.
That allows your applications to run in an environment which has no access to outside, and, thefore,
ensembles more control to the data in/out your organization.

That turns easiest to developers to create their applications,
because the outbound API Gateway is capable make an unification of authorization form.
For exemple, some application uses client certificate for authentication/authorization,
and other OAuth2.
That information is keeped by the outbound connectors, and to the internal applications,
it's only(and securely) used de standard method for authorization on the organization.

## How?

The main idea is to turn a cluster in outbound API Gateway,
on which the outside APIs used by the organization are configured,
using secured passwords os cerficates,
and turning easiest to the organization developers to use
the capabilities of outside APIs.

## Examples

### API with OAuth2

### API with client credentials

### Open API with cache
