const propType = {
  integer: {},
  smallint: {},
  text: {
    kind: 'text',
    choices: ['text', 'mediumtext', 'longtext']
  },
  string: {
    length: 255
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
  json: {}
}

export default propType
