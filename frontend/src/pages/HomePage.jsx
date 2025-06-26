import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Polls from '../components/Polls';
import Footer from '../components/Footer';
import CreatePoll from '../components/createPoll';

import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from '../store/globalSlices';
import { getPolls} from '../services/blockchain';
import { toast } from 'react-hot-toast';


const HomePage = () => {
  const dispatch = useDispatch();
  const { setPolls } = globalActions;
  const { polls } = useSelector((state) => state.globalStates);


  useEffect(() => {
    const init = async () => {
      try {
        const polldata = await getPolls(); // 🗳️ Fetch polls
        dispatch(setPolls(polldata));
      } catch (err) {
        console.warn('⚠️ HomePage init failed:', err);
        toast.error('Something went wrong loading polls');
      }
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
