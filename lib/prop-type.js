const propType = {
  integer: {},
  smallint: {},
  text: {
    kind: 'text',
    choices: ['text', 'mediumtext', 'longtext']
  },
  string: {
    maxLength: 255,
    minLength: 0
  },
  float: {
    precision: 8,
    scale: 2
  },
  double: {
    precision: 8,
    scale: 2
  },
  boolean: {},
  date: {},
  datetime: {},
  time: {},
  timestamp: {},
  object: {}
}

export default propType
