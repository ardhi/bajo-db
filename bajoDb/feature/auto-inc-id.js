async function autoIncId (opts = {}) {
  return {
    properties: [{
      name: 'id',
      type: 'integer',
      required: true,
      primary: true,
      autoInc: true
    }]
  }
}

export default autoIncId
