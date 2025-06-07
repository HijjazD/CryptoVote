import React from 'react';
import { formatDate, truncate } from '../utils/helper';
import { useNavigate } from 'react-router-dom'; // ✅ REPLACED useRouter


const Polls = ({polls}) => {

  return (
    <div>
      <h1 className="text-center text-[34px] font-semibold mb-5 text-white">Start Voting</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 pb-7 gap-[62px] max-w-7xl px-4 mx-auto">
        {polls.map((poll, i) => (
          <Poll key={i} poll={poll} />
        ))}
      </div>
    </div>
  );
};

const Poll = ({ poll }) => {
  const navigate = useNavigate(); // ✅ REPLACED useRouter

  return (
    <div className="mx-auto w-full max-w-[580px] grid grid-cols-1 md:flex gap-4 px-4">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex justify-between md:flex-col md:space-y-4 md:w-[217px]">
          {[...poll.avatars, '/assets/images/question.jpeg', '/assets/images/question.jpeg']
            .slice(0, 2)
            .map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt={poll.title}
                className="w-[45%] max-w-[140px] md:w-full h-[120px] md:h-[135px] rounded-[20px] object-cover"
              />
            ))}
        </div>

        <div className="w-full h-[257px] gap-[14px] rounded-[24px] space-y-5 md:w-[352px] md:h-[280px] bg-[#151515] px-[15px] py-[18px] md:px-[22px] text-white">
          <h1 className="text-[18px] font-semibold">
            {truncate({ text: poll.title, startChars: 30, endChars: 0, maxLength: 33 })}
          </h1>
          <p className="text-[14px]">
            {truncate({ text: poll.description, startChars: 90, endChars: 0, maxLength: 96 })}
          </p>

          <div className="flex justify-between items-center gap-[8px]">
            <div className="h-[26px] bg-[#2c2c2c] rounded-full py-[4px] px-[12px] text-[12px]">
              {formatDate(poll.startsAt)}
            </div>

            <div className="h-[32px] w-[119px] gap-[5px] flex items-center">
              <div className="h-[32px] w-[32px] rounded-full bg-[#2c2c2c]" />
              <p className="text-[12px]">
                {truncate({ text: poll.director, startChars: 4, endChars: 4, maxLength: 11 })}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/polls/' + poll.id)} // ✅ REPLACED router.push
            className="h-[44px] w-full rounded-full transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Polls;
