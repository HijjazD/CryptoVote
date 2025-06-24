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

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: 'CryptoVote',
    url: 'https://www.cryptovote.online',
  },
  injectProvider: true,
  storage: { enabled: true }, // ensures session is restored
});

const ethereum = MMSDK.getProvider();



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
    if (!ethereum) throw new Error("MetaMask not available");

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    store.dispatch(setWallet(address));
    return address;
  } catch (err) {
    console.error("Error connecting wallet:", err);
    throw err;
  }
};

// ✅ Restore wallet on refresh
const checkWallet = async () => {
  try {
    if (!ethereum) throw new Error("MetaMask not available");

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts && accounts.length > 0) {
      const address = accounts[0];

      // Restore into Redux
      store.dispatch(setWallet(address));
      store.dispatch(setProvider(null)); // don't store full provider

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

  console.log("📤 createPoll triggered with:", PollParams);

  try {
    const contract = await getEthereumContract(true);
    const { image, title, description, startsAt, endsAt } = PollParams;

    console.log("🚀 Sending tx via contract.createPoll...");

    // Trigger MetaMask but DO NOT await — especially for mobile redirect
    const txPromise = contract.createPoll(image, title, description, startsAt, endsAt);

    // Store poll data in case page reloads
    localStorage.setItem("pendingPoll", JSON.stringify(PollParams));
    localStorage.setItem("newPollPending", "true");

    // Try to get tx hash before MetaMask redirects (on desktop it works)
    txPromise
      .then((tx) => {
        console.log("✅ Tx hash from MetaMask:", tx.hash);
        localStorage.setItem("pendingTx", tx.hash);
      })
      .catch((err) => {
        console.error("❌ Tx failed or user rejected:", err);
        localStorage.removeItem("pendingPoll");
        localStorage.removeItem("newPollPending");
      });

    console.log("🏃 Exiting createPoll early (to let reload handle post-tx)");

    // No need to return txHash — it might not be available yet
    return;
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
