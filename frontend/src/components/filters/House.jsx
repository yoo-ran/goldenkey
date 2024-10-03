import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoubleRangeSlider from './DoubleRangeSlider/DoubleRangeSlider';


const House = ({approvalDate, numOfFloors, numOfRooms, onOpen}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [isParking, setIsParking] = useState(false)
  const [isEV, setIsEV] = useState(false)
  const [transactionMethods, setTransactionMethods] = useState([]);
  const [filteringData, setFilteringData] = useState({
    transactionMethod: '',
    depositRange: { min: 0, max: 3000 },
    rentRange: { min: 0, max: 150 },
    roomSizeRange: { min: 0, max: 1000 },
    approvalDate:"",
    numOfFloor:"",
    numOfRoom:"",
    isParking:false,
    isEV:false
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

  const handleSelect = (e) => {
    var name = e.target.name
    var value = e.target.value
    console.log(name, value);
    e.preventDefault();  // Prevent default behavior (like navigation)
    if(name === "isParking"){
      setIsParking(!isParking)
      setFilteringData({ ...filteringData, [name]: isParking });
    }
    else if(name==="isEV"){
      setIsEV(!isEV)
      setFilteringData({ ...filteringData, [name]: isEV });

    }
    else{
      setFilteringData({ ...filteringData, [name]: value });
    }

    console.log(isEV);
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

  console.log(filteringData);


  return (
    <main className={`w-full flexCol gap-y-8`}>
      <h1 className='border-b w-full pb-4 text-center'>주택/빌라</h1>
      <form className="w-full flexCol gap-y-20 " onSubmit={handleSubmit}>

        <section className="flexCol lg:flex-row gap-y-10 lg:gap-x-8 items-start lg:justify-betweeen w-11/12">
                <article className='flexCol gap-y-10 justify-between w-full lg:w-1/2'>

                  <div className="flexCol gap-y-4 w-full">
                      <div className='flexRow w-full gap-x-3'>
                        <p className="mobile_3_bold text-left">거래유형</p>
                        <p className='mobile_4'>중복선택가능</p>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 mt-2 w-full z-50">
                        {transactionMethods.map((method, index) => (
                          <button
                            key={index}
                            name={"transactionMethod"}
                            value={method}
                            onClick={handleSelect}
                            className={`py-2 text-center rounded mobile_5 ${filteringData.transactionMethod===method ? "bg-secondary-yellow":"bg-secondary-blue"}`}
                            >
                            {method}
                          </button>
                        ))}
                      </div>
                  </div>
                  <div className="flexCol items-start gap-y-8 w-full">
                      <p className='mobile_3_bold'>월세</p>
                      <div className="grid grid-rows-2">
                          <p className="mobile_4_bold">보증금</p>
                          <DoubleRangeSlider
                            min={0}
                            max={3000}
                            onChange={handleDepositRangeChange}
                          />
                      </div>
                      <div className="grid grid-rows-2">
                          <p className="mobile_4_bold">월세</p>
                          <DoubleRangeSlider
                            min={0}
                            max={1000}
                            onChange={handleRentRangeChange}
                          />
                      </div>
                      <div className='w-full grid grid-cols-2 gap-x-4 mobile_4_bold_b'>
                          <button className="btn_clear">
                            초기화
                          </button>
                          <button className='btn_clear bg-primary-yellow'>
                            적용
                          </button>
                      </div>
                  </div>
                  <div className="flexCol items-start gap-y-8 w-full ">
                        <p className='mobile_3_bold'>전세</p>
                        <div className="grid grid-rows-2">
                          <p className="mobile_4_bold">보증금</p>
                          <DoubleRangeSlider
                            min={0}
                            max={3000}
                            onChange={handleDepositRangeChange}
                          />
                        </div>

                        <div className="grid grid-rows-2">
                          <p className="mobile_4_bold">전세</p>
                          <DoubleRangeSlider
                            min={0}
                            max={1000}
                            onChange={handleRentRangeChange}
                          />
                        </div>
                        <div className='w-full grid grid-cols-2 gap-x-4 mobile_4_bold_b'>
                            <button className="btn_clear">
                              초기화
                            </button>
                            <button className='btn_clear bg-primary-yellow'>
                              적용
                            </button>
                        </div>
                    </div>

                </article>

                {/* 방크기 */}
                <article className="flexCol gap-y-10 items-start w-full lg:w-1/2">
                <div className="flexCol items-start gap-y-8 w-full">
                      <p className='mobile_3_bold'>매매</p>
                      <div className="grid grid-rows-2 ">
                          <p className="mobile_4_bold">매매금</p>
                        <DoubleRangeSlider
                          min={0}
                          max={3000}
                          onChange={handleDepositRangeChange}
                        />
                      </div>
                      <div className='w-full grid grid-cols-2 gap-x-4 mobile_4_bold_b'>
                        <button className="btn_clear">
                          초기화
                        </button>
                        <button className='btn_clear bg-primary-yellow'>
                          적용
                        </button>
                      </div>
                  </div>
                  <div>
                    <p className="mobile_3_bold">방크기</p>
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
              
                  <div className='flexCol gap-y-4 w-full'>
                    <p className='w-full mobile_4_bold'>사용 승인일</p>
                    <div className='w-full flexRow justify-between gap-x-2'>
                      {approvalDate.map((date, id)=>(
                        <button 
                          key={id}
                          name='approvalDate'
                          value={date}
                          onClick={handleSelect}
                          className={`px-3 py-2 text-center rounded mobile_5 ${filteringData.approvalDate===date ? "bg-secondary-yellow":"bg-secondary-blue"}`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='flexCol gap-y-4 w-full'>
                    <div className='w-full flexRow gap-x-3'>
                      <p className=' mobile_4_bold'>층 수</p>
                      <p className='mobile_4'>중복선택가능</p>
                    </div>
                    <div className='w-full flexRow justify-between gap-x-2'>
                      {numOfFloors.map((floor, id)=>(
                        <button 
                          key={id}
                          name={"numOfFloor"}
                          value={floor}
                          onClick={handleSelect}
                          className={`px-3 py-2 text-center rounded mobile_5 ${filteringData.numOfFloor===floor ? "bg-secondary-yellow":"bg-secondary-blue"}`}
                        >
                          {floor}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='flexCol gap-y-4 w-full'>
                    <p className='w-full mobile_4_bold'>방 개수</p>
                    <div className='w-full flexRow justify-between gap-x-2'>
                      {numOfRooms.map((room, id)=>(
                        <button 
                          key={id}
                          name={"numOfRoom"}
                          value={room}
                          onClick={handleSelect}
                          className={`px-3 py-2 text-center rounded mobile_5 ${filteringData.numOfRoom===room ? "bg-secondary-yellow":"bg-secondary-blue"}`}
                        >
                          {room}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='flexCol gap-y-4 w-full'>
                    <div className='w-full flexRow gap-x-3'>
                      <p className=' mobile_4_bold'>추가필터</p>
                      <p className='mobile_4'>중복선택가능</p>
                    </div>
                    <div className='w-full grid grid-cols-2 gap-x-2'>
                        <button 
                          name={"isParking"}
                          onClick={handleSelect}
                          className={` px-3 py-2 text-center rounded mobile_5 ${isParking ? "bg-secondary-yellow":"bg-secondary-blue"}`}
                        >
                          주차가능
                        </button>
                        <button
                          name={"isEV"}
                          onClick={handleSelect}
                          className={`bg-secondary-blue px-3 py-2 text-center rounded mobile_5 ${isEV ? "bg-secondary-yellow":"bg-secondary-blue"}`}
                        >
                          엘리베이터
                        </button>
                    </div>
                  </div>
                  </article>

          </section>
          <section className='w-11/12 lg:w-8/12 grid grid-rows-3 gap-y-4 mobile_4_bold_b'>
                    <button className='btn_clear' onClick={()=> {setOpen(false); onOpen(false)}}>
                      취소
                    </button>
                    <button className="btn_clear">
                      전체 초기화
                    </button>
                    <button type="submit" className="btn_save">
                      전체 적용
                    </button>
          </section>

      </form>
        
     
    </main>
  );
};

export default House;
