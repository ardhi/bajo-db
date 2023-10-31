const propType = {
  integer: {
    validator: 'number'
  },
  smallint: {
    validator: 'number'
  },
  text: {
    validator: 'string',
    kind: 'text',
    choices: ['text', 'mediumtext', 'longtext']
  },
  string: {
    validator: 'string',
    maxLength: 255,
    minLength: 0
  },
  float: {
    validator: 'number',
    precision: 8,
    scale: 2
  },
  double: {
    validator: 'number',
    precision: 8,
    scale: 2
  },
  boolean: {
    validator: 'boolean'
  },
  date: {
    validator: 'date'
  },
  datetime: {
    validator: 'date'
  },
  time: {
    validator: 'date'
  },
  timestamp: {
    validator: 'timestamp'
  },
  object: {}
}

export default propType