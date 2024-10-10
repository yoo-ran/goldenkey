// src/components/Home.jsx
import {useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faChevronRight, faCircleUser, faGear, faHouse, faHouseChimneyWindow, faSearch } from '@fortawesome/free-solid-svg-icons'
import { faHeart } from '@fortawesome/free-regular-svg-icons';

import apartmentImg from "../assets/home/apartment.jpg";
import houseImg from "../assets/home/house.jpg";
import officeTellImg from "../assets/home/officetell.jpg";
import oneroomImg from "../assets/home/oneroom.jpg";


const propertyType = [
    {type:"원룸 / 투룸", typeDescrp:"주택, 빌라, 오피스텔", img: oneroomImg},
    {type:"오피스텔", typeDescrp:"오피스텔 정보", img: officeTellImg},
    {type:"아파트", typeDescrp:"아파트 단지 정보, 실거래가", img: apartmentImg},
    {type:"주택, 빌라", typeDescrp:"주택, 빌라, 다세대", img:houseImg},
]

const recommendTag = [
    "무거동 전세", "대공원 호반베르디움", "두왕동매매", "선암동매매", "야음동전세", "옥동매매", "쌍용 스윗닷홈", "신정2동 아파트"
]

const Home = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [properties, setProperties] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [filterType, setFilterType] = useState("")
    const [propertyImages, setPropertyImages] = useState({}); // Store images by property ID


    const handleDataFromOneroom = (data) => {
        setReceivedData(data);
        console.log('Data received from Oneroom:', data);
    };
    
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:8000/listing');
                setProperties(response.data);

                for (const property of properties) {
                    const { 순번: propertyId } = property; // Assuming property ID is in '순번' field
                    try {
                    const imgRes = await axios.get(
                        `http://localhost:8000/properties/${propertyId}/images`
                    );
        
                    // Store images for each property using its ID
                    if (Array.isArray(imgRes.data.images)) {
                        setPropertyImages((prev) => ({
                        ...prev,
                        [propertyId]: imgRes.data.images,
                        }));
                    } else {
                        console.error("Unexpected response structure:", imgRes.data);
                    }
                    } catch (imageError) {
                    console.error(`Error fetching images for property ${propertyId}:`, imageError);
                    }
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const handleFilterPropertyType = (type)=> {
            navigate('/search', { state: type });
    }



    return (
        <main className='w-full gap-y-10'>

            {/* Sub Header */}
            <section className='flexRow justify-between w-11/12'>
                <h1>황금열쇠 이현지</h1>

                <article className='flexRow gap-x-6 mobile_1_bold'>
                    <FontAwesomeIcon icon={faCircleUser} className='text-primary-blue'/>
                    <FontAwesomeIcon icon={faGear} className=''/>
                </article>
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
                    <button
                        key={id}
                        style={{ backgroundImage: `url(${item.img})` }}
                        onClick={() => handleFilterPropertyType(item.type)}
                        className="relative overflow-hidden flexCol w-full lg: bg-cover bg-center rounded-4xl px-2 py-14"
                    >
                        <p className="absolute bg-black w-full h-full bg-opacity-50"></p>
                        <div className="border-l-8 pl-2 border-primary-yellow w-10/12 z-40 flexCol items-start gap-y-2 mobile_3_bold pl-8">
                            <p className="text-primary-yellow ">{item.type}</p>
                            <span className="text-white">{item.typeDescrp}</span>
                        </div>
                    </button>
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
                    {properties.slice(0,3).map((item, id) => {
                        
                        const { 순번: propertyId } = item; // Assuming '순번' is the unique property ID
                        const images = propertyImages[propertyId] || []; // Get images for this property
                        return (
                            <div
                                key={id}
                                style={{ backgroundImage: `url(http://localhost:8000${images[id]})` }}
                                className="w-full aspect-square bg-cover bg-center rounded-2xl "
                            >
                                <div className="w-full aspect-square flexRow items-start justify-end mobile_3_bold text-white ">
                                    <div className='bg-secondary-light p-2 m-2 aspect-square rounded-full'>
                                        <FontAwesomeIcon icon={faHeart} className='text-primary'/>
                                    </div>
                                </div>
                            </div>

                        )
                    })}
                </article>
            </section>

        </main>
    );
};

export default Home;
