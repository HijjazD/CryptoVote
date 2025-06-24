import { BrowserProvider, JsonRpcProvider, Contract, Wallet } from "ethers";
import { store } from "../store";
import { contractAbi, contractAddress } from "../constant/constant";
import { globalActions } from "../store/globalSlices";
import { MetaMaskSDK } from '@metamask/sdk';

const APP_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM'
const CHAIN_ID = 11155111; // Sepolia testnet

const { setWallet, setPolls, setPoll,setContestants,setProvider } = globalActions;

let walletProvider = null;
let signer = null;


let MMSDKInstance;

const getFreshMMSDK = () => {
  MMSDKInstance = new MetaMaskSDK({
    dappMetadata: {
      name: 'CryptoVote',
      url: 'https://www.cryptovote.online',
    },
    injectProvider: true,
    storage: { enabled: true },
  });

  return MMSDKInstance;
};


export const getAddress = async () => {
  const provider = new JsonRpcProvider(APP_RPC_URL); // read-only
  const code = await provider.getCode(contractAddress);
  return code;
};


// Updated for ethers v6
const getEthereumContract = async (withSigner = true) => {
  if (withSigner) {
    if (!walletProvider) {
      throw new Error("Wallet not connected. Call connectWallet() first.");
    }
    const provider = new BrowserProvider(walletProvider);
    signer = await provider.getSigner();
    // ✅ Log signer address here
    const address = await signer.getAddress();
    console.log("👤 Signer address:", address);

    return new Contract(contractAddress, contractAbi, signer);
  } else {
    // Read-only provider (e.g., Alchemy)
    const provider = new JsonRpcProvider(APP_RPC_URL);
    return new Contract(contractAddress, contractAbi, provider);
  }
};



// --- Connect Wallet ---
const connectWallet = async () => {
  try {
    const sdk = getFreshMMSDK();
    console.log("sdk: ", sdk)
    const ethereum = sdk.getProvider();

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new BrowserProvider(ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    walletProvider = ethereum;
    store.dispatch(setWallet(address));
    return address;
  } catch (err) {
    console.error("❌ Error connecting wallet:", err);

    // 👇 Hard reset on decryption failure
    if (err.message?.includes('ghash tag')) {
      localStorage.clear();
      location.reload();
    }

    throw err;
  }
};

// --- Restore Wallet Session ---
const checkWallet = async () => {
  try {
    const sdk = getFreshMMSDK();
    const ethereum = sdk.getProvider();


    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts && accounts.length > 0) {
      const address = accounts[0];
      walletProvider = ethereum;

      store.dispatch(setWallet(address));
      store.dispatch(setProvider(null));

      console.log("🔁 Session restored:", address);
      return address;
    } else {
      console.log("ℹ️ No session to restore");
      store.dispatch(setWallet(""));
      return null;
    }
  } catch (err) {
    console.error("❌ checkWallet failed:", err);
    store.dispatch(setWallet(""));
    store.dispatch(setProvider(null));
    return null;
  }
};


const createPoll = async (PollParams) => {
  if (!walletProvider) {
    reportError("Wallet not connected");
    return Promise.reject(new Error("Wallet not connected"));
  }
  console.log("🔌 walletProvider:", walletProvider);
  console.log("📤 createPoll triggered with:", PollParams);

  try {
    const contract = await getEthereumContract(true);
    const { image, title, description, startsAt, endsAt } = PollParams;

    console.log("🚀 Sending tx via contract.createPoll...");

    // ✅ Await the transaction
    const tx = await contract.createPoll(image, title, description, startsAt, endsAt);
    console.log("✅ Tx submitted:", tx.hash);

    // Optional: you can also wait for it to be mined
    const receipt = await tx.wait();
    console.log("✅ Tx confirmed in block:", receipt.blockNumber);

    return receipt; // or tx.hash
  } catch (error) {
    console.error("💥 createPoll error:", error);
    reportError(error);
    return Promise.reject(error);
  }
};



const updatePoll = async (id, PollParams) => {
  if (!walletProvider) {
    reportError("Wallet not connected");
    return Promise.reject(new Error("Wallet not connected"));
  }

  try {
    const contract = await getEthereumContract(true);
    const { image, title, description, startsAt, endsAt } = PollParams;
    const tx = await contract.updatePoll(id, image, title, description, startsAt, endsAt);

    await tx.wait();

    const poll = await getPoll(id);
    store.dispatch(setPoll(poll));

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};


const deletePoll = async (id) => {
  if (!walletProvider) {
    reportError("Wallet not connected");
    return Promise.reject(new Error("Wallet not connected"));
  }

  try {
    const contract = await getEthereumContract(true);
    const tx = await contract.deletePoll(id);

    await tx.wait();
    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};


const getPolls = async () => {
  const contract = await getEthereumContract(false); // use read-only
  const polls = await contract.getPolls();
  return structurePolls(polls);
};



const getPoll = async (id) => {
  const contract = await getEthereumContract(false);
  const poll = await contract.getPoll(id);
  return structurePolls([poll])[0]
};

const contestPoll = async (id, name, image) => {
  if (!walletProvider) {
    reportError("Wallet not connected");
    return Promise.reject(new Error("Wallet not connected"));
  }

  try {
    const contract = await getEthereumContract(true);
    const tx = await contract.contest(id, name, image);

    await tx.wait();

    const poll = await getPoll(id);
    store.dispatch(setPoll(poll));

    const contestants = await getContestants(id);
    store.dispatch(setContestants(contestants));

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};


const voteCandidate = async (id, cid) => {
  if (!walletProvider) {
    reportError("Wallet not connected");
    return Promise.reject(new Error("Wallet not connected"));
  }

  try {
    const contract = await getEthereumContract(true);
    const tx = await contract.vote(id, cid);
    await tx.wait();

    const poll = await getPoll(id);
    store.dispatch(setPoll(poll));

    const contestants = await getContestants(id);
    store.dispatch(setContestants(contestants));

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};


const getContestants = async (id) => {
  const contract = await getEthereumContract(false);
  const contestants = await contract.getContestants(id);
  return structureContestants(contestants)
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
  connectWallet, 
  checkWallet, 
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
