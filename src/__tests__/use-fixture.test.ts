import ava, { TestInterface } from 'ava'
import { db, DbContext } from '../../'

const test = ava as TestInterface<DbContext>

test.beforeEach(async t => {
  await db.setup(t.context)
})

test.afterEach(async t => {
  await db.teardown(t.context)
})
test('boots container', async t => {
  t.is(t.context.dbConfig.username, 'postgres', 'has default postgres user')
  const containerData = await t.context.dbContainer.inspect()
  t.truthy(containerData.Image, 'has docker image')
  t.is(containerData.State.Status, 'running', 'db is running')
  t.is(
    Object.keys(containerData.HostConfig.PortBindings).length,
    1,
    'has host port exposed'
  )
})
