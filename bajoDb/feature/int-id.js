async function intId (opts = {}) {
  return {
    properties: [{
      name: 'id',
      type: 'integer',
      required: true,
      primary: true,
      unsigned: true
    }]
  }
}

export default intId
