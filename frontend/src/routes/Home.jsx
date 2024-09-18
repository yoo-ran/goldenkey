// src/components/Home.jsx
import {useEffect, useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faChevronRight, faCircleUser, faGear, faHouse, faHouseChimneyWindow, faSearch } from '@fortawesome/free-solid-svg-icons'

import Oneroom from '../components/filters/Oneroom';

import { faHeart } from '@fortawesome/free-regular-svg-icons';

const propertyType = [
    {type:"원룸 / 투룸", typeDescrp:"주택, 빌라, 오피스텔"},
    {type:"오피스텔", typeDescrp:"오피스텔 정보"},
    {type:"아파트", typeDescrp:"아파트 단지 정보, 실거래가"},
    {type:"주택, 빌라", typeDescrp:"주택, 빌라, 다세대"},
]

const recommendTag = [
    "무거동 전세", "대공원 호반베르디움", "두왕동매매", "선암동매매", "야음동전세", "옥동매매", "쌍용 스윗닷홈", "신정2동 아파트"
]

const Home = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [properties, setProperties] = useState([]);
    const [openFilter, setOpenFilter] = useState(false)


    const handleDataFromOneroom = (data) => {
        setReceivedData(data);
        console.log('Data received from Oneroom:', data);
    };
    
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:8000/listing');
                setProperties(response.data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };



    return (
        <main className='w-full gap-y-16'>

            {/* Sub Header */}
            <section className='flexRow justify-between w-11/12'>
                <h1>황금열쇠 이현지</h1>

                <article className='flexRow gap-x-6 mobile_1_bold'>
                    <FontAwesomeIcon icon={faCircleUser} className='text-primary-blue'/>
                    <FontAwesomeIcon icon={faGear} className=''/>
                </article>
            </section>    

            {/* Filter Section */}
            <div className='absolute flexCol z-50 top-32 border w-full py-20 bg-white'>
                <Oneroom />
            </div>
            <section className='w-11/12 lg:w-10/12 flexRow justify-between'>
                <div className='flexCol relative'>
                    <button
                        className='flexCol bg-primary-yellow rounded-lg aspect-square w-10 px-3 py-2 '
                        onClick={()=> {
                            setOpenFilter(!openFilter)
                            console.log("lo");
                        }}
                    >
                        <FontAwesomeIcon icon={faHouse}/>
                    </button>
                    <div className={`absolute top-12 flexCol bg-white gap-y-4 mobile_6 w-28 overflow-fiddeng transition-[opacity]  ${openFilter ? "": "opacity-0"}`}>
                        <button className={` transition-all  ${openFilter ? "translate-y-1.5": "opacity-0"}`}>
                            <FontAwesomeIcon icon={faHouse}/>
                            <p>원룸 / 투룸</p>
                        </button>
                        <button className={` transition-all  ${openFilter ? "translate-y-1.5": "opacity-0"}`}>
                            <FontAwesomeIcon icon={faBuilding}/>
                            <p>아파트 / 오피스텔</p>
                        </button>
                        <button className={` transition-all  ${openFilter ? "translate-y-1.5": "opacity-0"}`}>
                            <FontAwesomeIcon icon={faHouseChimneyWindow}/>
                            <p>주택 / 빌라</p>
                        </button>
                    </div>
                    
                </div>

                <div className='flexRow gap-x-2 mobile_4 text-secondary bg-secondary-light p-3 rounded-lg lg:rounded-full lg:pl-8 lg:py-2 w-8/12'>
                    <FontAwesomeIcon icon={faSearch}/>
                    <input
                        type='search'
                        placeholder='검색어를 입력하세요'
                        className='bg-transparent'
                    />
                </div>
                <button className='mobile_3'>
                    Cancel
                </button>
            </section>

            {/* 추천태그 */}
            <section className='w-11/12 lg:w-10/12 flexCol gap-y-4'>
                <h2 className='w-full'>추천태그</h2>
                <article className='w-full flexRow flex-wrap gap-3 mobile_5_bold text-primary'>
                    {
                        recommendTag.map((tag,index)=>(
                            <button key={index} className='bg-secondary-blue rounded px-3 py-2 hover:bg-secondary-yellow hover:text-primary-orange'>
                                {tag}
                            </button>
                        ))
                    }
                </article>
            </section>

            {/* Property Type */}
            <section className='w-11/12 lg:w-10/12'>
                <article className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6'>
                {propertyType.map((item, id) => (
                    <div
                        key={id}
                        // style={{ backgroundImage: `url(${Images[id]})` }}
                        className="relative overflow-hidden flexCol w-full lg: bg-cover bg-center rounded-4xl px-2 py-14"
                    >
                        <div className="absolute bg-black w-full h-full bg-opacity-50"></div>
                        <div className="border-l-8 pl-2 border-primary-yellow w-10/12 z-40 flexCol items-start gap-y-2 mobile_3_bold pl-8">
                            <p className="text-primary-yellow ">{item.type}</p>
                            <span className="text-white">{item.typeDescrp}</span>
                        </div>
                    </div>
                ))}
                </article>
            </section>

            {/* 최근 검색한 매물 */}
            <section className='w-11/12 flexCol gap-y-4'>
                <h2 className='flexRow gap-x-4 w-full'>
                    최근 검색한 매물
                    <FontAwesomeIcon icon={faChevronRight}/>
                </h2>
                <article className='w-full grid grid-cols-3 lg:grid-cols-4 gap-x-3 lg:gap-x-5'>
                    {propertyType.slice(0,3).map((item, id) => (
                        <div
                            key={id}
                            // style={{ backgroundImage: `url(${Images[id]})` }}
                            className="w-full aspect-square bg-cover bg-center rounded-2xl "
                        >
                            <div className="w-11/12 aspect-square flexRow items-end justify-end mobile_3_bold text-white ">
                                <div className='bg-secondary-light p-2 aspect-square rounded-full'>
                                    <FontAwesomeIcon icon={faHeart} className=''/>
                                </div>
                            </div>
                        </div>
                    ))}
                </article>
            </section>

        </main>
    );
};

export default Home;
