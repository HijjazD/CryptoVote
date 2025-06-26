import { JsonRpcProvider, Contract } from "ethers";
import { store } from "../store";
import { contractAbi, contractAddress } from "../constant/constant";
import { globalActions } from "../store/globalSlices";
import { getWalletClient, getAccount } from 'wagmi/actions';
import { wagmiAdapter } from '../config' 
import { walletClientToSigner } from '@reown/appkit-adapter-wagmi';

const APP_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM'

const { setWallet, setPoll,setContestants } = globalActions;


// Read-only contract instance
const getAddress = async () => {
  const provider = new JsonRpcProvider(APP_RPC_URL);
  const code = await provider.getCode(contractAddress);
  return code;
};

// ✅ Get Contract Instance
const getEthereumContract = async (withSigner = true) => {
  if (withSigner) {
    const walletClient = await wagmiAdapter.getWalletClient(); // ✅ Reown gives walletClient
    if (!walletClient) throw new Error("⚠️ Wallet client not ready. Please reconnect.");

    const signer = walletClientToSigner(walletClient); // ✅ Convert viem → ethers.Signer

    return new Contract(contractAddress, contractAbi, signer); // ✅ Safe now
  } else {
    const provider = new JsonRpcProvider(APP_RPC_URL);
    return new Contract(contractAddress, contractAbi, provider);
  }
};



// --- Create Poll ---
const createPoll = async (PollParams) => {
  try {
    const contract = await getEthereumContract(true);

    const { image, title, description, startsAt, endsAt } = PollParams;
    console.log('📤 Sending createPoll with:', PollParams);

    const tx = await contract.createPoll(image, title, description, startsAt, endsAt);
    console.log('✅ Tx submitted:', tx.hash);

    const receipt = await tx.wait();
    console.log('✅ Tx confirmed:', receipt.blockNumber);

    return receipt;
  } catch (err) {
    console.error('💥 createPoll error:', err);
    throw err;
  }
};

// ✅ Update Poll
const updatePoll = async (id, PollParams) => {
  try {
    const contract = await getEthereumContract(true);
    const { image, title, description, startsAt, endsAt } = PollParams;
    const tx = await contract.updatePoll(id, image, title, description, startsAt, endsAt);

    await tx.wait();

    const poll = await getPoll(id);
    store.dispatch(setPoll(poll));

    return tx;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// ✅ Delete Poll
const deletePoll = async (id) => {
  try {
    const contract = await getEthereumContract(true);
    const tx = await contract.deletePoll(id);
    await tx.wait();
    return tx;
  } catch (error) {
    reportError(error);
    throw error;
  }
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

// ✅ Contest in a Poll
const contestPoll = async (id, name, image) => {
  try {
    const contract = await getEthereumContract(true);
    const tx = await contract.contest(id, name, image);
    await tx.wait();

    const poll = await getPoll(id);
    const contestants = await getContestants(id);

    store.dispatch(setPoll(poll));
    store.dispatch(setContestants(contestants));

    return tx;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// ✅ Vote Candidate
const voteCandidate = async (id, cid) => {
  try {
    const contract = await getEthereumContract(true);
    const tx = await contract.vote(id, cid);
    await tx.wait();

    const poll = await getPoll(id);
    const contestants = await getContestants(id);

    store.dispatch(setPoll(poll));
    store.dispatch(setContestants(contestants));

    return tx;
  } catch (error) {
    reportError(error);
    throw error;
  }
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


const reportError = (error) => {
  console.error(error);
};

export { 
  createPoll, 
  getPolls, 
  getPoll, 
  formatDate, 
  truncate, 
  updatePoll, 
  formatTimestamp, 
  deletePoll,
  contestPoll,
  getContestants,
  voteCandidate
};
