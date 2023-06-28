import {deepStrictEqual, rejects} from 'node:assert/strict'
import {test} from 'node:test'

import testReporterJson from '@mafalda-sfu/test-reporter-json'


test('layout', function()
{
  deepStrictEqual(typeof testReporterJson, 'function')
})

test('source', async function()
{
  const source = [
    {data: {name: 'test 1'}, type: 'test:start'},
    {data: {name: 'test 1'}, type: 'test:pass'},
    {data: {name: 'test 2'}, type: 'test:start'},
    {
      data: {details: {error: {message: 'test 2 error'}}, name: 'test 2'},
      type: 'test:fail'
    },
    {data: {name: 'test 2', plan: {end: 2, start: 1}}, type: 'test:plan'},
    {
      data: {message: 'test 2 diagnostic', name: 'test 2'},
      type: 'test:diagnostic'
    },
    {data: {coverage: {}, name: 'test 2'}, type: 'test:coverage'}
  ]

  const asyncGenerator = testReporterJson(source)

  deepStrictEqual(typeof asyncGenerator, 'object')
  deepStrictEqual(typeof asyncGenerator.next, 'function')
  deepStrictEqual(typeof asyncGenerator.return, 'function')
  deepStrictEqual(typeof asyncGenerator.throw, 'function')

  deepStrictEqual(await asyncGenerator.next(), {
    done: false,
    value: '{\n' +
      '  "passed": [\n' +
      '    {\n' +
      '      "name": "test 1"\n' +
      '    }\n' +
      '  ],\n' +
      '  "failed": [\n' +
      '    {\n' +
      '      "name": "test 2",\n' +
      '      "details": {\n' +
      '        "error": {\n' +
      '          "message": "test 2 error"\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  ],\n' +
      '  "name": "test 2",\n' +
      '  "plan": {\n' +
      '    "end": 2,\n' +
      '    "start": 1\n' +
      '  },\n' +
      '  "diagnostics": [\n' +
      '    "test 2 diagnostic"\n' +
      '  ],\n' +
      '  "coverage": {}\n' +
      '}'
  })
  deepStrictEqual(await asyncGenerator.next(), {done: true, value: undefined})
})

test('unknown event type', async function()
{
  const source = [
    {type: 'foo'}
  ]

  const asyncGenerator = testReporterJson(source)

  await rejects(asyncGenerator.next())
})
