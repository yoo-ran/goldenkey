// src/components/Home.jsx
import {useEffect, useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faCircleUser, faGear, faHouse, faSearch } from '@fortawesome/free-solid-svg-icons'

import Login from '../components/Login';
import Signup from '../components/Signup';
import ImportExcel from '../components/feature/ImportExcel';

import PropertyCarousel from '../components/feature/PropertyCarousel';

import Images from '../components/feature/importImg'; // Import the custom Image component
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
            <section className='w-11/12 flexRow justify-between'>
                <button
                    className='flexCol bg-primary-yellow rounded-lg aspect-square w-10 px-3 py-2'
                >
                    <FontAwesomeIcon icon={faHouse}/>
                </button>
                <div className='flexRow gap-x-2 mobile_4 text-secondary bg-secondary-light p-3 rounded-lg w-8/12'>
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
            <section className='w-11/12 flexCol gap-y-4'>
                <h2 className='w-full'>추천태그</h2>
                <article className='w-full flexRow flex-wrap gap-3 mobile_5_bold text-primary'>
                    {
                        recommendTag.map((tag,index)=>(
                            <div key={index} className='bg-secondary-blue rounded px-3 py-2'>
                                {tag}
                            </div>
                        ))
                    }
                </article>
            </section>

            {/* Property Type */}
            <section className='w-11/12'>
                <article className='flexRow flex-wrap gap-y-4'>
                {propertyType.map((item, id) => (
                    <div
                        key={id}
                        style={{ backgroundImage: `url(${Images[id]})` }}
                        className="relative overflow-hidden flexCol w-full bg-cover bg-center rounded-4xl px-2 py-14"
                    >
                        <div className="absolute bg-black w-full h-full bg-opacity-50"></div>
                        <div className="border-l-8 pl-2 border-primary-yellow w-10/12 z-50 flexCol items-start gap-y-2 mobile_3_bold pl-8">
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
                <article className='w-full flexRow  gap-3'>
                    {propertyType.slice(0,3).map((item, id) => (
                        <div
                            key={id}
                            style={{ backgroundImage: `url(${Images[id]})` }}
                            className="w-1/3 aspect-square bg-cover bg-center rounded-2xl "
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
