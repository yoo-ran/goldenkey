import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseChimneyWindow, faHouse, faBuilding, faSearch } from '@fortawesome/free-solid-svg-icons';


import Oneroom from '../filters/Oneroom.jsx';
import House from '../filters/House.jsx';
import Apartment from '../filters/Apartment.jsx';

const approvalDate = ["15년 이내", "10년 이내", "5년 이내", "15년 이상"]
const numOfFloors = ["반지하", "1층", "2층 이상", "옥탑"]
const numOfRooms = ["상관없음", "1개", "2개", "3개", "4개 이상"]


const SearchHeader = ({ onSendSearchTerm  }) => {
    const [openFilter, setOpenFilter] = useState(false);
    const [filterType, setFilterType] = useState("");
    const [isOpen, setIsOpen] = useState(true); // Control isOpen independently


    const filterPropertyType = () => {

        const closeFilter = openFilter ? "" : openFilter
        
        switch (filterType) {
            case "house/villa":
                return <House approvalDate={approvalDate} numOfFloors={numOfFloors} numOfRooms={numOfRooms}  isOpen={true} closeFilter={closeFilter}/>;
        
            case "oneroom/tworoom":
                return <Oneroom />;
        
            case "apartment":
                return <Apartment />;
        
            default:

                return null; // or any default component you'd like to render
        }
        
    }


    const searchHandle = (e) => {
        const searchTerm = e.target.value;
        // Pass the search term to the parent component (Search)
        onSendSearchTerm(searchTerm);
    };



    return (
          <section className='w-11/12 lg:w-10/12 flexRow justify-between relative z-40'>
                <div className={`absolute border-2 rounded-lg drop-shadow p-4 top-14 flexCol bg-primary gap-y-4 mobile_6 w-full overflow-hidden transition-[all]  ${openFilter ? "translate-y-1.5": "opacity-0"}`}>
                    <article className='mobile_4_bold border-b w-full text-center text-primary-yellow pb-4'><p>거주유형선택</p></article>
                    <article className='w-full'>
                        <p className='mobile_4 text-primary-yellow'>옵션을 선택하세요</p>
                        <div className='grid grid-cols-3 gap-x-4 mt-3'>
                            <button
                                onClick={()=> setFilterType("house/villa")} 
                                className={`w-full  py-4 mobile_5 rounded-lg ${filterType ==="house/villa" ? "bg-secondary-yellow":"bg-secondary-light "}`}
                            >
                                <FontAwesomeIcon icon={faHouseChimneyWindow} className='mobile_1_bold'/>
                                <p>주택 / 빌라</p>
                            </button>
                            <button
                                onClick={()=> setFilterType("oneroom/tworoom")} 
                                className={`bg-secondary-light w-full py-4 mobile_5  rounded-lg ${filterType ==="oneroom/tworoom" ? "bg-secondary-yellow":"bg-secondary-light "}`}
                            >
                                <FontAwesomeIcon icon={faHouse} className='mobile_1_bold'/>
                                <p>원룸 / 투룸</p>
                            </button>
                            <button
                                onClick={()=> setFilterType("apartment")} 
                                className={`bg-secondary-light w-full  py-4 mobile_5 rounded-lg  ${filterType ==="apartment" ? "bg-secondary-yellow":"bg-secondary-light "}`}
                            >
                                <FontAwesomeIcon icon={faBuilding} className='mobile_1_bold'/>
                                <p>아파트 / 오피스텔</p>
                            </button>
                        </div>
                    </article>
                </div>
                <div className='flexCol'>
                    <button
                        className='flexCol bg-primary-yellow rounded-lg aspect-square w-10 px-3 py-2 '
                        onClick={()=> {
                            setOpenFilter(!openFilter)
                        }}
                    >
                        <FontAwesomeIcon icon={faHouse}/>
                    </button>
                </div>

                <div className='flexRow gap-x-2 mobile_4 text-secondary bg-secondary-light p-2 rounded-lg lg:rounded-full lg:pl-8 lg:py-2 w-8/12'>
                    <FontAwesomeIcon icon={faSearch}/>
                    <input
                        type='search'
                        placeholder='검색어를 입력하세요'
                        className='bg-transparent text-primary mobile_3'
                        onChange={searchHandle}
                    />
                </div>
                <button className='mobile_3'>
                    검색
                </button>
                {/* <div className={`absolute flexCol z-50 top-32 border w-full pt-4 pb-8 bg-white ${filterType == "" ? "hidden":"" }`}> */}
                    { filterPropertyType()}
                {/* </div> */}
        </section>
    );
};

export default SearchHeader;
