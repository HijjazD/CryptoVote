import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Polls from '../components/Polls';
import Footer from '../components/Footer';
import CreatePoll from '../components/createPoll';

import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from '../store/globalSlices';
import { getPolls, checkWallet } from '../services/blockchain';
import { toast } from 'react-hot-toast';
import { JsonRpcProvider } from 'ethers';

const HomePage = () => {
  const dispatch = useDispatch();
  const { setPolls } = globalActions;
  const { polls } = useSelector((state) => state.globalStates);

  const APP_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/rSJ1WKfAB8oVr6HkTxKFB6UwhAj5TvLM';

  useEffect(() => {
    const fetchPolls = async () => {
      const data = await getPolls();
      dispatch(setPolls(data));
    };

    const resumePendingTx = async () => {
      const pendingTx = localStorage.getItem('pendingTx');
      const isNewPoll = localStorage.getItem('newPollPending');

      if (!pendingTx || isNewPoll !== 'true') return;

      try {
        toast.loading('Waiting for transaction confirmation...');
        const provider = new JsonRpcProvider(APP_RPC_URL);
        const receipt = await provider.waitForTransaction(pendingTx);
        console.log('Confirmed tx:', receipt);

        toast.dismiss();
        toast.success('Poll created successfully 👌');

        // ✅ Refresh polls again now that new poll is confirmed
        const updatedPolls = await getPolls();
        dispatch(setPolls(updatedPolls));
      } catch (err) {
        console.error('Tx confirmation failed:', err);
        toast.dismiss();
        toast.error('Poll creation failed 🤯');
      } finally {
        // ✅ Clean up
        localStorage.removeItem('pendingTx');
        localStorage.removeItem('newPollPending');
      }
    };

    fetchPolls();
    resumePendingTx();
    checkWallet();
  }, [dispatch, setPolls]);

  return (
    <div className='flex flex-col min-h-screen pt-5'>
      <div className='px-4'>
        <Navbar />
      </div>
      <div className='pt-30 flex-grow'>
        <Banner />
        <Polls polls={polls} />
        <CreatePoll />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
