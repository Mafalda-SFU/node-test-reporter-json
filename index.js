import {errToJSON} from 'error-to-json'


/**
 * @param source
 */
export default async function*(source)
{
  let test = {}

  const nesting = [test]

  for await(const {data, type} of source)
    switch(type)
    {
      case 'test:enqueue':
      case 'test:dequeue':
      case 'test:watch:drained':
        break

      case 'test:start':
        test = data
        nesting.push(test)
        break

      case 'test:pass':
      {
        const oldTest = Object.assign(nesting.pop(), data)

        test = nesting.at(-1)

        let {passed} = test
        if(!passed) test.passed = passed = []

        passed.push(oldTest)
        break
      }

      case 'test:fail':
      {
        const oldTest = Object.assign(nesting.pop(), data)
        oldTest.details.error = errToJSON(oldTest.details.error)

        test = nesting.at(-1)

        let {failed} = test
        if(!failed) test.failed = failed = []

        failed.push(oldTest)
        break
      }

      case 'test:plan':
        Object.assign(test, data)
        break

      case 'test:diagnostic':
      {
        let {diagnostics} = test
        if(!diagnostics) test.diagnostics = diagnostics = []

        diagnostics.push(data.message)
        break
      }

      case 'test:stderr':
      {
        let {messages} = test
        if(!messages) test.messages = messages = []

        messages.push(Object.assign({date: new Date, type: 'stderr'}, data))

        break
      }

      case 'test:stdout':
      {
        let {messages} = test
        if(!messages) test.messages = messages = []

        messages.push(Object.assign({date: new Date, type: 'stdout'}, data))

        break
      }

      case 'test:coverage':
      {
        Object.assign(test, data)

        yield JSON.stringify(test, null, 2)
        break
      }

      default:
        throw new Error(`Unknown event type: ${type}`)
    }
}
