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
    const init = async () => {
      await checkWallet(); // restore wallet session
      const polldata = await getPolls(); // get polls after wallet restored
      dispatch(setPolls(polldata));
    };
  
    init();
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
