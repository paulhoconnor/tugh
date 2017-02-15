module.exports = class DAOBase {
  constructor (options) {
    this.name = 'base'
  }

  getName (code, url) {
    return this.name
  }
}
