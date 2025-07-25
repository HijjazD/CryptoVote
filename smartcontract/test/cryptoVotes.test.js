const { expect } = require('chai')
const { expectRevert } = require('@openzeppelin/test-helpers')

describe('Contracts', () => {
  let contract, result

  const description = 'Lorem Ipsum'
  const title = 'Republican Primary Election'
  const image = 'https://image.png'
  const starts = Date.now() - 10 * 60 * 1000
  const ends = Date.now() + 10 * 60 * 1000
  const pollId = 1
  const contestantId = 1

  const avater1 = 'https://avatar1.png'
  const name1 = 'Nebu Ballon'
  const avater2 = 'https://avatar2.png'
  const name2 = 'Kad Neza'

  beforeEach(async () => {
    const Contract = await ethers.getContractFactory('cryptoVotes')
    ;[deployer, contestant1, contestant2, voter1, voter2, voter3] = await ethers.getSigners()

    contract = await Contract.deploy()
    await contract.deployed()
  })

  describe('Poll Management', () => {
    describe('Success', () => {
        it('should confirm poll creation success', async () => {
        result = await contract.getPolls()
        expect(result).to.have.lengthOf(0)

        await contract.createPoll(image, title, description, starts, ends)

        result = await contract.getPolls()
        expect(result).to.have.lengthOf(1)

        result = await contract.getPoll(pollId)
        expect(result.title).to.be.equal(title)
        expect(result.director).to.be.equal(deployer.address)
      })
      it('should confirm poll update success', async () => {
        await contract.createPoll(image, title, description, starts, ends)

        result = await contract.getPoll(pollId)
        expect(result.title).to.be.equal(title)

        await contract.updatePoll(pollId, image, 'New Title', description, starts, ends)

        result = await contract.getPoll(pollId)
        expect(result.title).to.be.equal('New Title')
      })
      it('should confirm poll deletion success', async () => {
        await contract.createPoll(image, title, description, starts, ends)

        result = await contract.getPolls()
        expect(result).to.have.lengthOf(1)

        result = await contract.getPoll(pollId)
        expect(result.deleted).to.be.equal(false)

        await contract.deletePoll(pollId)

        result = await contract.getPolls()
        expect(result).to.have.lengthOf(0)

        result = await contract.getPoll(pollId)
        expect(result.deleted).to.be.equal(true)
      })
    })

    describe('Failure', () => {
      it('should confirm contest entry failure', async () => {
        // Try voting on a poll that doesn't exist
        await expectRevert(contract.vote(100, contestantId), 'Poll not found')

        // Now create a poll
        await contract.createPoll(image, title, description, starts, ends)

        // Then delete it
        await contract.deletePoll(pollId)

        // Try voting again — this time on a deleted poll
        await expectRevert(contract.vote(pollId, contestantId), 'Polling not available')
      })
    })

  })


})