/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dns', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    it('should resolve a DNS link', function (done) {
      this.timeout(20 * 1000)
      this.retries(3)

      ipfs.dns('ipfs.io', { r: true }, (err, path) => {
        expect(err).to.not.exist()
        expect(path).to.exist()
        done()
      })
    })

    // skipping because there is an error in https://ipfs.io/api/v0/dns?arg=ipfs.io
    // unskip when it is resolved and the new version released: https://github.com/ipfs/go-ipfs/issues/6086
    it.skip('should non-recursively resolve ipfs.io', () => {
      return ipfs.dns('ipfs.io', { recursive: false }).then(res => {
      // matches pattern /ipns/<ipnsaddress>
        expect(res).to.match(/\/ipns\/.+$/)
      })
    })

    it('should recursively resolve ipfs.io', () => {
      return ipfs.dns('ipfs.io', { recursive: true }).then(res => {
      // matches pattern /ipfs/<hash>
        expect(res).to.match(/\/ipfs\/.+$/)
      })
    })

    it('should resolve subdomain docs.ipfs.io', () => {
      return ipfs.dns('docs.ipfs.io').then(res => {
      // matches pattern /ipfs/<hash>
        expect(res).to.match(/\/ipfs\/.+$/)
      })
    })
  })
}
