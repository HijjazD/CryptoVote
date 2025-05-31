import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import Polls from '../components/Polls'
import Footer from '../components/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '../store/globalSlices'

import CreatePoll from '../components/createPoll'
import { getPolls } from '../services/blockchain'

const HomePage = () => {
  const dispatch = useDispatch()
  const { setPolls } = globalActions
  const { polls } = useSelector((state) => state.globalStates)


  useEffect(() => {
    const fetchPolls = async () => {
      const data = await getPolls(); // wait for the resolved data
      dispatch(setPolls(data));     // now dispatch actual poll objects
    };

    fetchPolls();
  }, [dispatch, setPolls]);



  return (
    <div className='flex flex-col min-h-screen pt-5'>
      <div className='px-4'>
        <Navbar />
      </div>
      <div className="pt-30 flex-grow">
        <Banner />
        <Polls polls={polls} />
        <CreatePoll />
      </div>
      <Footer /> 
    </div>
  )
}

export default HomePage
