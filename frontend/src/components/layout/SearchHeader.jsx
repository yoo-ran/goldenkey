import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseChimneyWindow, faHouse, faBuilding, faSearch } from '@fortawesome/free-solid-svg-icons';


import Oneroom from '../filters/Oneroom.jsx';
import House from '../filters/House.jsx';
import Apartment from '../filters/Apartment.jsx';

const approvalDate = ["15년 이내", "10년 이내", "5년 이내", "15년 이상"]


const SearchHeader = ({ onSendSearchTerm  }) => {
    const [openFilter, setOpenFilter] = useState(false);
    const [filterType, setFilterType] = useState("");


    const filterPropertyType = () => {

        
            switch (filterType) {
                case "house/villa":
                    return <House approvalDate={approvalDate} onOpen={onOpenFromChild}  />;
            
                case "oneroom/tworoom":
                    return <Oneroom approvalDate={approvalDate} onOpen={onOpenFromChild}/>;
            
                case "apartment":
                    return <Apartment approvalDate={approvalDate} onOpen={onOpenFromChild}/>;
            
                default:
    
                    return null; // or any default component you'd like to render
            }
        
    }


    const searchHandle = (e) => {
        const searchTerm = e.target.value;
        // Pass the search term to the parent component (Search)
        onSendSearchTerm(searchTerm);
    };

    const onOpenFromChild = (openFromChild) => {
       if(openFromChild === false) setFilterType("")
    }


    return (
          <section className='w-11/12 md:w-full relative  z-50 flexCol'>
                <div className={`relative w-full  top-14  flexCol gap-y-4`} >
                    <article className={`absolute  z-50 top-0 md:left-0 bg-primary border-2 rounded-md drop-shadow p-4 md:p-0 md:pb-4  mobile_6 w-full md:w-2/12 transition-[all]  ${openFilter ? "translate-y-1.5": "opacity-0"}`}>
                        <div className='mobile_4_bold border-b w-full text-center text-primary-yellow pb-4 md:py-4'><p>거주유형선택</p></div>
                        <div className='w-full  md:pl-4'>
                            <p className='mobile_5 text-primary-yellow'>옵션을 선택하세요</p>
                            <div className='grid grid-cols-3 md:grid-cols-1 md:grid-rows-3 gap-x-4 gap-y-8 mt-3'>
                                <button
                                    onClick={()=> filterType !=="house/villa" ? setFilterType("house/villa") : setFilterType("")} 
                                    className={`w-full  py-4 mobile_5 rounded-md md:rounded-r-none ${filterType ==="house/villa" ? "bg-secondary-yellow":"bg-secondary-light "}`}
                                >
                                    <FontAwesomeIcon icon={faHouseChimneyWindow} className='mobile_1_bold'/>
                                    <p>주택 / 빌라</p>
                                </button>
                                <button
                                    onClick={()=> filterType !=="oneroom/tworoom" ? setFilterType("oneroom/tworoom"): setFilterType("")} 
                                    className={`bg-secondary-light w-full py-4 mobile_5  rounded-md md:rounded-r-none ${filterType ==="oneroom/tworoom" ? "bg-secondary-yellow":"bg-secondary-light "}`}
                                >
                                    <FontAwesomeIcon icon={faHouse} className='mobile_1_bold'/>
                                    <p>원룸 / 투룸</p>
                                </button>
                                <button
                                    onClick={()=> filterType !=="apartment" ? setFilterType("apartment"): setFilterType("")} 
                                    className={`bg-secondary-light w-full  py-4 mobile_5 rounded-md md:rounded-r-none  ${filterType ==="apartment" ? "bg-secondary-yellow":"bg-secondary-light "}`}
                                >
                                    <FontAwesomeIcon icon={faBuilding} className='mobile_1_bold'/>
                                    <p>아파트 / 오피스텔</p>
                                </button>
                            </div>
                        </div>
                    </article>
                    <article className={`absolute flexCol top-44 md:top-2 z-40 md:right-0 border w-full md:w-10/12 py-8 bg-white transition-all overflow-hidden transform ${filterType === "" || openFilter===false ? "scale-y-0":"" }`}>
                        { filterPropertyType()}
                    </article>
                </div>
               
                <article className='flexRow justify-between md:w-10/12'>
                    <div className='flexCol'>
                        <button
                            className='flexCol bg-primary-yellow rounded-md aspect-square w-10 px-3 py-2 '
                            onClick={()=> {
                                setOpenFilter(!openFilter)
                            }}
                        >
                            <FontAwesomeIcon icon={faHouse}/>
                        </button>
                    </div>

                    <div className='flexRow gap-x-2 mobile_4 text-secondary bg-secondary-light p-2 rounded-md md:rounded-full md:pl-8 md:py-2 w-8/12'>
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
                </article>
              
        </section>
    );
};

export default SearchHeader;
