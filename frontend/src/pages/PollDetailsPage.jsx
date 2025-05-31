import React,{useEffect} from 'react'
import Navbar from '../components/Navbar'
import Details from '../components/Details'
import Contestants from '../components/Contestants'
import UpdatePoll from '../components/UpdatePoll'
import DeletePoll from '../components/DeletePoll'
import ContestPoll from '../components/ContestPoll'
import { getPoll, getContestants } from '../services/blockchain'
import { globalActions } from '../store/globalSlices'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'


const PollDetailsPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { setPoll, setContestants } = globalActions
    const { poll, contestants } = useSelector((state) => state.globalStates)

    useEffect(() => {
        const fetchPolls = async () => {
            const data = await getPoll(id); // wait for the resolved data
            const contestantData = await getContestants(id)
            dispatch(setPoll(data));     // now dispatch actual poll objects
            dispatch(setContestants(contestantData))
    };

        fetchPolls();
    }, [id, dispatch]);

  

  return (
    <div className='flex flex-col min-h-screen pt-5'>
        <div className='px-4'> 
            <Navbar />
        </div>

        <div className='pt-20'>
            <Details poll={poll}/>
        </div>

        <div className='pt-20'>
            {Array.isArray(contestants) && contestants?.map ? (
                <Contestants contestants={contestants} poll={poll} />
            ) : (
            <p className="text-center text-gray-500 text-lg">Loading contestants...</p>
            )}


        </div>
        {poll && (
            <>
                <UpdatePoll pollData={poll} />
                <DeletePoll poll={poll}/>
                <ContestPoll poll={poll}/>
            </>
        )}
    </div>
  )
}

export default PollDetailsPage