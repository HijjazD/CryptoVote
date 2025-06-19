import { BrowserProvider, JsonRpcProvider, Contract, Wallet } from "ethers";
import { store } from "../store";
import { contractAbi, contractAddress } from "../constant/constant";
import { globalActions } from "../store/globalSlices";
import WalletConnectProvider from "@walletconnect/ethereum-provider";

const APP_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM'
const WALLETCONNECT_PROJECT_ID = "4234666a862ca5511dd22e000d2bb773"
const CHAIN_ID = 11155111; // Sepolia testnet

const { setWallet, setPolls, setPoll,setContestants,setProvider } = globalActions;

let walletProvider = null;
let signer = null;

/**
 * Initialize wallet provider using WalletConnect or MetaMask
 */

const getWalletProvider = async () => {
  // Attempt WalletConnect first
  try {
    walletProvider = await WalletConnectProvider.init({
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [CHAIN_ID],
      showQrModal: true,
      rpcMap: {
        [CHAIN_ID]: APP_RPC_URL,
      },
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
      ],
      events: ["accountsChanged", "chainChanged", "disconnect"],
      metadata: {
        name: "cryptovote",
        description: "Blockchain based voting system project",
        url: "https://www.cryptovote.online",
        icons: ["https://www.cryptovote.online/assets/images/cv.png"],
      },
    });

    // Try connect
    await walletProvider.connect();

    return walletProvider;
  } catch (wcError) {
    console.warn("❌ WalletConnect connect() failed:", wcError.message || wcError);

    // ✅ Retry MetaMask only if WalletConnect was cancelled
    if (
      wcError?.message?.includes("User closed modal") || 
      wcError?.message?.includes("Modal closed") ||
      wcError?.message?.includes("User rejected")
    ) {
      console.log("🔁 Trying MetaMask fallback...");

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          walletProvider = window.ethereum;
          await walletProvider.request({ method: "eth_requestAccounts" });
          return walletProvider;
        } catch (mmError) {
          console.error("MetaMask request failed:", mmError);
          throw mmError;
        }
      }
    }

    // If fallback not available
    throw new Error("No wallet provider connected.");
  }
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
    return new Contract(contractAddress, contractAbi, signer);
  } else {
    // Read-only provider (e.g., Alchemy)
    const provider = new JsonRpcProvider(APP_RPC_URL);
    return new Contract(contractAddress, contractAbi, provider);
  }
};

const connectWallet = async () => {
  try {
    const providerSource = await getWalletProvider(); // can be WalletConnect or MetaMask
    const provider = new BrowserProvider(providerSource);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    store.dispatch(setWallet(address));

    // ✅ Add listeners if using WalletConnect (e.g. MetaMask mobile)
    if (providerSource?.on && providerSource.isWalletConnect) {
      providerSource.on("accountsChanged", (accounts) => {
        const address = accounts?.[0] || "";
        store.dispatch(setWallet(address));
      });

      providerSource.on("disconnect", () => {
        store.dispatch(setWallet(""));
        alert("Wallet disconnected.");
      });

      providerSource.on("chainChanged", (chainId) => {
        const decimalChain = parseInt(chainId, 16);
        if (decimalChain !== CHAIN_ID) {
          alert("Please switch to Sepolia network.");
      }
});

    }

    return address;
  } catch (err) {
    console.error("Error connecting wallet:", err);
    throw err;
  }
};

const checkWallet = async () => {
  try {
    let address = "";
    let provider = null;

    // ✅ Restore MetaMask session if available
    if (typeof window !== "undefined" && window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts?.length > 0) {
        address = accounts[0];
        provider = window.ethereum;
        walletProvider = window.ethereum;
        console.log("🔌 MetaMask session active:", address);
      }
    }

    // ✅ Update Redux store
    store.dispatch(setWallet(address || ""));
    store.dispatch(setProvider(null)); // avoid storing provider in Redux

    return provider;
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

  console.log("trying to createpoll...");

  try {
    const contract = await getEthereumContract(true);
    const signer = contract.runner; // ethers v6

    const { image, title, description, startsAt, endsAt } = PollParams;

    // ✅ Use the correct v6 pattern
    const txRequest = await contract.createPoll.populateTransaction(
      image, title, description, startsAt, endsAt
    );

    const tx = await signer.sendTransaction(txRequest);

    // ✅ Save hash early before redirect
    localStorage.setItem("pendingTx", tx.hash);
    localStorage.setItem("newPollPending", "true");

    console.log("tx sent:", tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("createPoll error:", error);
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
