import { BrowserProvider, JsonRpcProvider, Contract, Wallet } from "ethers";
import { store } from "../store";
import { contractAbi, contractAddress } from "../constant/constant";
import { globalActions } from "../store/globalSlices";
import WalletConnectProvider from "@walletconnect/ethereum-provider";

const APP_RPC_URL = import.meta.env.VITE_APP_RPC_URL;
const ALCHEMY_API_KEY ="rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM"
const { setWallet, setPolls, setPoll,setContestants } = globalActions;

const WALLETCONNECT_PROJECT_ID = "4234666a862ca5511dd22e000d2bb773"

let walletConnectProvider;
let walletType = "walletconnect";

const initWalletConnectProvider = async () => {
  if (!walletConnectProvider) {
    walletConnectProvider = await WalletConnectProvider.init({
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [11155111], 
      rpcMap: {
        11155111: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      },
      showQrModal: true,
    });

    walletConnectProvider.on("disconnect", () => {
      store.dispatch(setWallet(""));
      walletType = "metamask";
    });
  }
  return walletConnectProvider;
};

// Get window.ethereum
const getEthereum = () => {
  if (typeof window !== "undefined") {
    return window.ethereum;
  }

  if (walletConnectProvider && walletConnectProvider.connected) {
    return walletConnectProvider;
  }
  return null;
};

export const getAddress = async() => {
  const contract = await getEthereumContract();
  const provider = contract.runner.provider; // ethers v6 way

  const code = await provider.getCode(contractAddress);
  return code

}


// Updated for ethers v6
const getEthereumContract = async () => {
  let provider;
  let signer;

  if (walletType === "metamask") {
    const ethereum = getEthereum();
    if (!ethereum) throw new Error("Ethereum object not found. Make sure MetaMask is installed.");

    const accounts = await ethereum.request?.({ method: "eth_accounts" });

    if (accounts?.[0]) {
      provider = new BrowserProvider(ethereum);
      signer = await provider.getSigner();
    } else {
      provider = new JsonRpcProvider(APP_RPC_URL);
      const wallet = Wallet.createRandom().connect(provider);
      signer = wallet;
    }
  } else if (walletType === "walletconnect") {
    const providerWC = await initWalletConnectProvider();
    await providerWC.enable();
    provider = new BrowserProvider(providerWC);
    signer = await provider.getSigner();
  } else {
    // fallback to readonly provider
    provider = new JsonRpcProvider(APP_RPC_URL);
    const wallet = Wallet.createRandom().connect(provider);
    signer = wallet;
  }

  return new Contract(contractAddress, contractAbi, signer);
};


const connectWallet = async (type = "metamask") => {
  try {
    walletType = type;

    if (walletType === "metamask") {
      const ethereum = window.ethereum;

      if (!ethereum) {
        // No MetaMask detected, fallback to WalletConnect
        walletType = "walletconnect";

        const provider = await initWalletConnectProvider();
        await provider.enable();

        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();

        store.dispatch(setWallet(address));
        return; // done
      }

      // MetaMask detected, request accounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      store.dispatch(setWallet(accounts[0]));
    } else if (walletType === "walletconnect") {
      const provider = await initWalletConnectProvider();
      await provider.enable();

      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      store.dispatch(setWallet(address));
    }
  } catch (error) {
    console.error(error);
    alert("Failed to connect wallet: " + (error.message || error));
  }
};



const checkWallet = async () => {
  try {
    if (walletType === "metamask") {
      const ethereum = getEthereum();
      if (!ethereum) return reportError("Please install MetaMask");

      const accounts = await ethereum.request?.({ method: "eth_accounts" });

      ethereum.on("chainChanged", () => window.location.reload());
      ethereum.on("accountsChanged", async (accounts) => {
        store.dispatch(setWallet(accounts?.[0] || ""));
        await checkWallet();
      });

      if (accounts?.length) {
        store.dispatch(setWallet(accounts[0]));
      } else {
        store.dispatch(setWallet(""));
        reportError("Please connect wallet, no accounts found.");
      }
    } else if (walletType === "walletconnect") {
      if (!walletConnectProvider) return;

      if (walletConnectProvider.connected) {
        const ethersProvider = new BrowserProvider(walletConnectProvider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        store.dispatch(setWallet(address));
      } else {
        store.dispatch(setWallet(""));
        reportError("Please connect your WalletConnect wallet");
      }
    }
  } catch (error) {
    reportError(error);
  }
};


const createPoll = async (PollParams) => {
  const ethereum = getEthereum();
  if (!ethereum) {
    reportError("Please install Metamask");
    return Promise.reject(new Error("Metamask not installed"));
  }

  try {
    const contract = await getEthereumContract();
    const { image, title, description, startsAt, endsAt } = PollParams;
    const tx = await contract.createPoll(image, title, description, startsAt, endsAt);

    await tx.wait();

    const polls = await getPolls()
    store.dispatch(setPolls(polls))

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};

const updatePoll = async (id, PollParams) => {
  const ethereum = getEthereum();
  if (!ethereum) {
    reportError("Please install Metamask");
    return Promise.reject(new Error("Metamask not installed"));
  }

  try {
    const contract = await getEthereumContract();
    const { image, title, description, startsAt, endsAt } = PollParams;
    const tx = await contract.updatePoll(id, image, title, description, startsAt, endsAt);

    await tx.wait();

    const poll = await getPoll(id)
    store.dispatch(setPoll(poll))

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};

const deletePoll = async (id) => {
  const ethereum = getEthereum();
  if (!ethereum) {
    reportError("Please install Metamask");
    return Promise.reject(new Error("Metamask not installed"));
  }

  try {
    const contract = await getEthereumContract();
    const tx = await contract.deletePoll(id);

    await tx.wait();
    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};

const getPolls = async () => {
  const contract = await getEthereumContract();
  const polls = await contract.getPolls();
  return structurePolls(polls);
};


const getPoll = async (id) => {
  const contract = await getEthereumContract();
  const poll = await contract.getPoll(id);
  return structurePolls([poll])[0]
};

const contestPoll = async (id, name, image ) => {
  const ethereum = getEthereum();
  if (!ethereum) {
    reportError("Please install Metamask");
    return Promise.reject(new Error("Metamask not installed"));
  }

  try {
    const contract = await getEthereumContract();
    const tx = await contract.contest(id, name, image);

    await tx.wait();

    const poll = await getPoll(id)
    store.dispatch(setPoll(poll))

    const contestants = await getContestants(id)
    console.log("this is contestant that will be dispatch: ", contestants)
    store.dispatch(setContestants(contestants))

    console.log("Updated poll in store:", store.getState().globalStates.poll)
    console.log("Updated contestants in store:", store.getState().globalStates.contestants)

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};

const voteCandidate = async (id, cid ) => {
  const ethereum = getEthereum();
  if (!ethereum) {
    reportError("Please install Metamask");
    return Promise.reject(new Error("Metamask not installed"));
  }

  try {
    const contract = await getEthereumContract();
    //vote
    const tx = await contract.vote(id, cid);
    await tx.wait();

    const poll = await getPoll(id)
    store.dispatch(setPoll(poll))

    const contestants = await getContestants(id)
    store.dispatch(setContestants(contestants))

    return Promise.resolve(tx);
  } catch (error) {
    reportError(error);
    return Promise.reject(error);
  }
};

const getContestants = async (id) => {
  const contract = await getEthereumContract();
  const contestants = await contract.getContestants(id);
  console.log("This is from getContestants. contestants:", contestants)
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
