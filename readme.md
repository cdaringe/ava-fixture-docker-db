# ava-fixture-docker-db

acquire a fresh docker database container attached to your ava test context

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/cdaringe/postgraphile-upsert.svg)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/cdaringe/ava-fixture-docker-db.svg?style=svg)](https://circleci.com/gh/cdaringe/ava-fixture-docker-db)

## usage

```ts
import ava, { TestInterface } from 'ava'
import { db, DbContext } from 'ava-fixture-docker-db'

const test = ava as TestInterface<DbContext>

test.beforeEach(t => db.setup(t.context)) // setup(context, dbOptions, dockerodeOptions)
test.afterEach(t => db.teardown(t.context))

test('some that needs a db!', async t => {
  t.is(t.context.dbConfig.username, 'postgres', 'has default postgres user')
  const containerData = await t.context.dbContainer.inspect()
  t.truthy(containerData.Image, 'has docker image')
  t.is(containerData.State.Status, 'running', 'db is running')
  t.is(Object.keys(containerData.HostConfig.PortBindings).length, 1, 'has host port exposed')
})
```
see the exported typescript typings or source for the simple additional APIs you can use in setup.
