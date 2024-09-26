import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoubleRangeSlider from './DoubleRangeSlider/DoubleRangeSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';


const House = ({approvalDate, numOfFloors, numOfRooms}) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("거래유형을 선택하세요");
  const [open, setOpen] = useState(false);
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [filteringData, setFilteringData] = useState({
    selectedMethod: '',
    depositRange: { min: 0, max: 3000 },
    rentRange: { min: 0, max: 150 },
    roomSizeRange: { min: 0, max: 1000 },
    거래방식: '',
    거래완료여부: '',
  });

  const handleDepositRangeChange = useCallback(({ min, max }) => {
    setFilteringData((prev) => ({
      ...prev,
      depositRange: { min, max },
    }));
  }, []);

  const handleRentRangeChange = useCallback(({ min, max }) => {
    setFilteringData((prev) => ({
      ...prev,
      rentRange: { min, max },
    }));
  }, []);

  const handleRoomSizeRangeChange = useCallback(({ min, max }) => {
    setFilteringData((prev) => ({
      ...prev,
      roomSizeRange: { min, max },
    }));
  }, []);

  const handleSelect = (e, option) => {
    console.log(e.target);
    e.preventDefault();  // Prevent default behavior (like navigation)
    setFilteringData({ ...filteringData, selectedMethod: option });
    setSelectedOption(option);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: filteringData });
  };

  const fetchConstantVariable = async () => {
    try {
      const response = await axios.get('http://localhost:8000/transaction-methods');
      setTransactionMethods(response.data);
    } catch (error) {
      console.error('Error fetching property data:', error);
    }
  };

  useEffect(() => {
    fetchConstantVariable();
  }, []);




  return (
    <main className="w-11/12 flexCol gap-y-20">
      <h1 className='border-b w-full pb-4 text-center'>거래 유형 설정</h1>
      <form className="w-full flexCol gap-y-20 lg:flexRow items-start justify-between" onSubmit={handleSubmit}>
        {/* 거래유형 */}
        <section className="flexCol gap-y-8 items-start w-full">
          <article className="flexCol items-start gap-y-16  w-full">

            <div className="flexCol gap-y-8 w-full">
                <p className="mobile_1_bold w-full text-left">거래유형</p>
                <ul className="flexRow gap-x-3 mt-2 w-full z-50">
                  {transactionMethods.map((option, index) => (
                    <li
                      key={index}
                      onClick={(e) => handleSelect(e, option)}
                      className="w-full cursor-pointer bg-secondary-blue rounded text-primary text-center py-1.5"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
            </div>
            <div className="flexCol items-start gap-y-8 w-full">
                <p className='mobile_1_bold'>매매</p>
                <div className="grid grid-rows-2 ">
                  <div>
                    <p className="mobile_3_bold">매매금</p>
                  </div>
                  <DoubleRangeSlider
                    min={0}
                    max={3000}
                    onChange={handleDepositRangeChange}
                  />
                </div>
                <div className='w-full grid grid-cols-2 gap-x-4 mobile_3_bold_b'>
                  <button className="btn_clear">
                    초기화
                  </button>
                  <button className='btn_clear bg-primary-yellow'>
                    적용하기
                  </button>
                </div>
            </div>
            <div className="flexCol items-start gap-y-8 w-full">
                <p className='mobile_1_bold'>월세</p>
              <div className="grid grid-rows-2">
                <div>
                  <p className="mobile_3_bold">보증금</p>
                </div>
                <DoubleRangeSlider
                  min={0}
                  max={3000}
                  onChange={handleDepositRangeChange}
                />
              </div>
              <div className="grid grid-rows-2">
                <div>
                  <p className="mobile_3_bold">월세</p>
                </div>
                <DoubleRangeSlider
                  min={0}
                  max={1000}
                  onChange={handleRentRangeChange}
                />
              </div>
              <div className='w-full grid grid-cols-2 gap-x-4 mobile_3_bold_b'>
                  <button className="btn_clear">
                    초기화
                  </button>
                  <button className='btn_clear bg-primary-yellow'>
                    적용하기
                  </button>
              </div>
            </div>
            <div className="flexCol items-start gap-y-8 w-full">
                <p className='mobile_1_bold'>전세</p>
              <div className="grid grid-rows-2">
                <div>
                  <p className="mobile_3_bold">보증금</p>
                </div>
                <DoubleRangeSlider
                  min={0}
                  max={3000}
                  onChange={handleDepositRangeChange}
                />
              </div>
              <div className="grid grid-rows-2">
                <div>
                  <p className="mobile_3_bold">전세</p>
                </div>
                <DoubleRangeSlider
                  min={0}
                  max={1000}
                  onChange={handleRentRangeChange}
                />
              </div>
              <div className='w-full grid grid-cols-2 gap-x-4 mobile_3_bold_b'>
                  <button className="btn_clear">
                    초기화
                  </button>
                  <button className='btn_clear bg-primary-yellow'>
                    적용하기
                  </button>
              </div>
            </div>            
          </article>
        </section>

        {/* 방크기 */}
        <section className="flexCol gap-y-8 items-start w-full">
          <div>
            <p className="mobile_1_bold">방크기</p>
          </div>
          <div className="">
            <div className="flexRow">
              <span>매물 유형별 기준면적</span>
            </div>
            <DoubleRangeSlider
              min={0}
              max={1000} 
              onChange={handleRoomSizeRangeChange}
            />
          </div>
        </section>
      
        <section className='w-full flexCol gap-y-8 pt-10 border-t-2 border-primary-yellow '>
          <article className='flexCol gap-y-4 w-full'>
            <p className='w-full mobile_3_bold'>사용 승인일</p>
            <div className='w-full flexRow justify-between gap-x-2'>
              {approvalDate.map((date, id)=>(
                <div 
                  key={id}
                  className='bg-secondary-blue px-3 py-2 text-center rounded mobile_5'
                >
                  {date}
                </div>
              ))}
            </div>
          </article>
          <article className='flexCol gap-y-4 w-full'>
            <p className='w-full mobile_3_bold'>층 수</p>
            <div className='w-full flexRow justify-between gap-x-2'>
              {numOfFloors.map((floor, id)=>(
                <div 
                  key={id}
                  className='bg-secondary-blue px-3 py-2 text-center rounded mobile_5'
                >
                  {floor}
                </div>
              ))}
            </div>
          </article>
          <article className='flexCol gap-y-4 w-full'>
            <p className='w-full mobile_3_bold'>방 개수</p>
            <div className='w-full flexRow justify-between gap-x-2'>
              {numOfRooms.map((room, id)=>(
                <div 
                  key={id}
                  className='bg-secondary-blue px-3 py-2 text-center rounded mobile_5'
                >
                  {room}
                </div>
              ))}
            </div>
          </article>
          <article className='flexCol gap-y-4 w-full'>
            <p className='w-full mobile_3_bold'>추가필터</p>
            <div className='w-full grid grid-cols-2 gap-x-2'>
                <button 
                  className='bg-secondary-blue px-3 py-2 text-center rounded mobile_5'
                >
                  주차가능
                </button>
                <button 
                  className='bg-secondary-blue px-3 py-2 text-center rounded mobile_5'
                >
                  엘리베이터
                </button>
            </div>
          </article>
      

        </section>
      </form>
        
      <section className='w-full grid grid-rows-3 gap-y-4 mobile_3_bold_b'>
        <button className='btn_clear'>
          취소
        </button>
        <button className="btn_clear">
          초기화
        </button>
        <button type="submit" className="btn_save">
          적용하기
        </button>
      </section>
    </main>
  );
};

export default House;
