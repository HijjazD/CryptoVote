import { JsonRpcProvider, Contract } from "ethers";
import { contractAbi, contractAddress } from "../constant/constant";

const APP_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM'

// ✅ Get Contract Instance
const getEthereumContract = async (withSigner = true) => {
    const provider = new JsonRpcProvider(APP_RPC_URL);
    return new Contract(contractAddress, contractAbi, provider);
};


// ✅ Get All Polls
const getPolls = async () => {
  const contract = await getEthereumContract(false);
  const polls = await contract.getPolls();
  return structurePolls(polls);
};

// ✅ Get Single Poll
const getPoll = async (id) => {
  const contract = await getEthereumContract(false);
  const poll = await contract.getPoll(id);
  return structurePolls([poll])[0];
};



// ✅ Get Contestants for a Poll
const getContestants = async (id) => {
  const contract = await getEthereumContract(false);
  const contestants = await contract.getContestants(id);
  return structureContestants(contestants);
};

const structureContestants = (contestants) => 
  contestants
    .map((contestant) => ({
      id: Number(contestant.id),
      image: contestant.image,
      name: contestant.name,
      voter: contestant.voter.toLowerCase(),
      votes: Number(contestant.votes),
      voters: contestant.voters.map((voter) => voter.toLowerCase()),
    }))
    .sort((a, b) => b.votes - a.votes);


const structurePolls = (polls) => {
  return polls
    .map((poll) => ({
      id: Number(poll.id),
      image: poll.image,
      title: poll.title,
      description: poll.description,
      votes: Number(poll.votes),
      contestants: Number(poll.contestants),
      deleted: poll.deleted,
      director: poll.director.toLowerCase(),
      startsAt: Number(poll.startsAt),
      endsAt: Number(poll.endsAt),
      timestamp: Number(poll.timestamp),
      voters: poll.voters.map((voter) => voter.toLowerCase()),
      avatars: poll.avatars,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const dayOfWeek = daysOfWeek[date.getUTCDay()]
  const month = months[date.getUTCMonth()]
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()

  return `${dayOfWeek}, ${month} ${day}, ${year}`
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const truncate = ({text, startChars, endChars, maxLength}) => {
  if (text.length > maxLength) {
    let start = text.substring(0, startChars)
    let end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}


export { 
  getPolls, 
  getPoll, 
  formatDate, 
  truncate, 
  formatTimestamp, 
  getContestants,
};
