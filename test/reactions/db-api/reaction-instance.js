const { assert } = require('chai')
const rewire = require('rewire')
const sinon = require('sinon')
require('sinon-mongoose')

const ReactionType = require('../../../reactions/models/reaction-type')
const sampleReactionType = new ReactionType({
  method: 'LIKE',
  startingDate: new Date('2017-12-20 00:00:00'),
  closingDate: new Date('2018-02-20 00:00:00')
})

const ReactionInstance = require('../../../reactions/models/reaction-instance')
const reactionInstance = require('../../../reactions/db-api/reaction-instance')
const sampleReactionInstance = {
  reactionId: sampleReactionType._id,
  resourceType: 'Article',
  resourceId: '000001',
  results: []
}

describe('db-api.reactionInstance', function () {
  describe('#create', function () {
    it('should create a reaction instance', function () {
      // require module with rewire to override its internal ReactionInstance reference
      const reactionInstance = rewire('../../../reactions/db-api/reaction-instance')

      // replace ReactionInstance constructor for a spy
      const ReactionInstanceMock = sinon.spy()

      // add a save method that only returns the data
      ReactionInstanceMock.prototype.save = function () { return Promise.resolve(sampleReactionInstance) }

      // create a spy for the save method
      const save = sinon.spy(ReactionInstanceMock.prototype, 'save')

      // override ReactionInstance inside `reactionInstance/db-api/reaction-type`
      reactionInstance.__set__('ReactionInstance', ReactionInstanceMock)

      // call create method
      return reactionInstance.create(sampleReactionInstance)
        .then((result) => {
          sinon.assert.calledWith(ReactionInstanceMock, sampleReactionInstance)
          sinon.assert.calledOnce(save)
          assert.equal(result, sampleReactionInstance)
        })
    })
  })

  describe('#get', function () {
    it('should get a reactionInstance', function () {
      const ReactionInstanceMock = sinon.mock(ReactionInstance)

      ReactionInstanceMock
        .expects('find').withArgs({ _id: 'ID' })
        .chain('exec')
        .resolves(sampleReactionInstance)

      return reactionInstance.get('ID')
        .then((result) => {
          ReactionInstanceMock.verify()
          ReactionInstanceMock.restore()
          assert.equal(result, sampleReactionInstance)
        })
    })
  })
  describe('#list', function () {
    it('should list all reactionInstances', function () {
      const ReactionInstanceMock = sinon.mock(ReactionInstance)

      ReactionInstanceMock
        .expects('paginate').withArgs({}, { limit: 10, page: 1 })
        .resolves(sampleReactionInstance)

      return reactionInstance.list({ limit: 10, page: 1 })
        .then((result) => {
          ReactionInstanceMock.verify()
          ReactionInstanceMock.restore()
          assert.equal(result, sampleReactionInstance)
        })
    })
  })

  describe('#update', function () {

    it('should update a reactionInstance', function () {
      const ReactionInstanceMock = sinon.mock(ReactionInstance)
      const save = sinon.spy(() => sampleReactionInstance)

      ReactionInstanceMock
        .expects('find').withArgs({ _id: 'ID' })
        .chain('exec')
        .resolves({ save })

      return reactionInstance.update({ id: 'ID', reactionInstance: {} })
        .then((result) => {
          ReactionInstanceMock.verify()
          ReactionInstanceMock.restore()
          sinon.assert.calledOnce(save)
          assert.equal(result, sampleReactionInstance)
        })
    })
  })

  describe('#remove', function () {

    it('should remove a reactionInstance', function () {
      const ReactionInstanceMock = sinon.mock(ReactionInstance)
      const remove = sinon.spy()

      ReactionInstanceMock
        .expects('find').withArgs({ _id: 'ID' })
        .chain('exec')
        .resolves({ remove })

      return reactionInstance.remove('ID')
        .then(() => {
          ReactionInstanceMock.verify()
          ReactionInstanceMock.restore()
          sinon.assert.calledOnce(remove)
        })
    })
  })
})
