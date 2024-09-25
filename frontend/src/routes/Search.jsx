// src/components/User.jsx
import {useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons';
import { useLocation } from 'react-router-dom';

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import Memo from '../components/feature/Memo';
import SearchHeader from '../components/layout/SearchHeader';


const Search = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Retrieve the state (data) from navigation
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [properties, setProperties] = useState([]);
    const [propertyImages, setPropertyImages] = useState({});
    const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || ""); // Use state for search term
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [rangeValues, setRangeValues] = useState({
        selectedMethod: 'all',
        depositRange: { min: 0, max: 3000 },
        rentRange: { min: 0, max: 150 },
        roomSizeRange: { min: 0, max: 1000 },
    });

    // Fetch property listings and images
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:8000/listing');
                const propertyList = response.data;
                setProperties(propertyList);
                const favoriteResponse = await axios.get('http://localhost:8000/get-favorites', { withCredentials: true });
                if (favoriteResponse.status === 200) {
                    setFavoriteIds(favoriteResponse.data.favorites); // Set favoriteIds
                } else {
                    console.error('Failed to fetch favorite IDs');
                }
                // Fetch images for each property
                for (const property of propertyList) {
                    const { 순번: propertyId } = property;
                    try {
                        const imgRes = await axios.get(`http://localhost:8000/properties/${propertyId}/images`);
                        if (Array.isArray(imgRes.data.images)) {
                            setPropertyImages((prev) => ({
                                ...prev,
                                [propertyId]: imgRes.data.images,
                            }));
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

    // Function to filter properties based on range and search term
    useEffect(() => {
        const filtered = properties.filter((property) => {
            const matchesSearchTerm = property.건물명.includes(searchTerm) || property.도로명.includes(searchTerm);

            const withinDepositRange =
                property.보증금 >= rangeValues.depositRange.min && property.보증금 <= rangeValues.depositRange.max;
            const withinRentRange =
                property.월세 >= rangeValues.rentRange.min && property.월세 <= rangeValues.rentRange.max;
            const withinRoomSizeRange =
                property.전용m2 >= rangeValues.roomSizeRange.min && property.전용m2 <= rangeValues.roomSizeRange.max;
            const matchesSelectedMethod = rangeValues.selectedMethod === 'all' || property.거래방식 === rangeValues.selectedMethod;

            return matchesSearchTerm && withinDepositRange && withinRentRange && withinRoomSizeRange && matchesSelectedMethod;
        });
console.log(filtered);
        setFilteredProperties(filtered);
    }, [properties, searchTerm, rangeValues]);

    const handleSearchTerm = (term) => {
        const filtered = properties.filter((property) => 
            property.건물명.includes(term) ||  property.도로명.includes(term) // Assuming property names are in Korean
        );

        setFilteredProperties(filtered);
    };



    const formatToKoreanCurrency = (number) => {
        const billion = Math.floor(number / 100000000);
        const remainder = number % 100000000;
        const thousand = Math.floor(remainder / 10000000);
        let result = '';
        if (billion > 0) {
            result += `${billion}억`;
        }
        if (thousand > 0) {
            result += ` ${thousand}천`;
        }
        if (!result) {
            result = number.toString();
        }
        return result.trim();
    };

    // Manage favorite IDs
    const heartClick = async (pId) => {
        setFavoriteIds((prevArr) => {
            let updatedFavorites;
            if (prevArr.includes(pId)) {
                updatedFavorites = prevArr.filter(id => id !== pId);
            } else {
                updatedFavorites = [...prevArr, pId];
            }
            saveFavoriteIds(updatedFavorites);
            return updatedFavorites;
        });
    };

    const saveFavoriteIds = async (updatedFavorites) => {
        try {
            const response = await axios.post('http://localhost:8000/save-favorites', {
                favorites: updatedFavorites
            }, { withCredentials: true });
            if (response.status !== 200) {
                console.error('Failed to save favorites');
            }
        } catch (error) {
            console.error('Error saving favorite IDs:', error);
        }
    };

    const handleItemClick = (id) => {
        navigate(`/detail/${id}`, { state: { propertyId: id } });
    };

    return (
        <main className='w-full gap-y-16'>

            <SearchHeader onSendSearchTerm={handleSearchTerm} />

            {/* 검색결과 */}
            <section className='w-11/12 flexCol gap-y-4'>
                <h2 className='w-full'>{filteredProperties.length > 0 ? filteredProperties.length : properties.length}개의 검색결과</h2>
                <article className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8'>

                {(filteredProperties.length > 0 ? filteredProperties : properties).map((property) => {                        
                    const { 순번: propertyId } = property; // Assuming '순번' is the unique property ID
                        const images = propertyImages[propertyId] || []; // Get images for this property

                        return (
                            <div 
                                key={propertyId}
                                className='flexRow gap-x-4 lg:flexCol gap-y-4'
                                onClick={() => handleItemClick(property.순번)} // Handle item click
                            >
                                <div className="w-4/12 lg:w-full flexCol relative bg-secondary-light h-full rounded">
                                    {images.length > 0 ? (
                                        <img
                                            src={`http://localhost:8000${images[0]}`}
                                            alt={`Property Image 1`}
                                            className=" object-cover lg:rounded-4xl"
                                        />
                                    ) : (
                                        <p className='text-center mobile_5'>No images available</p>
                                    )}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the handleItemClick from being triggered
                                            heartClick(propertyId); // Call the heartClick function
                                        }}                                         
                                        className='absolute top-1 right-1 z-30'
                                    >
                                          <FontAwesomeIcon icon={faRegularHeart} className='absolute top-0 right-0 text-primary border border-white p-1 rounded-full mobile_5'/>
                                        {favoriteIds.includes(propertyId) ? (
                                            <FontAwesomeIcon icon={faSolidHeart} className='absolute top-0 right-0 p-1 border border-white p-1 rounded-full mobile_5 text-primary-yellow' />
                                        ) : ""}
                                    </div>
                                </div>
                                <div className='flexCol items-start w-8/12 gap-y-4 lg:w-11/12'>
                                    {/* <p className='mobile_1_bold'>{property.거래방식}</p> */}
                                    <p className='mobile_1_bold'>
                                        {property.거래방식} {property.거래방식 === "매매"? formatToKoreanCurrency(property.보증금) : property.보증금/property.월세}
                                    </p>
                                    <div>
                                        <ul className='flexRow mobile_5'>
                                            <li>{property.부동산구분}</li>
                                            <li>|</li>
                                            <li>{property.건물명}</li>
                                        </ul>
                                        <ul className='flexRow gap-x-1 mobile_5'>
                                            <li>{property.전체m2}m<sup>2</sup>,</li>
                                            <li>관리비 {property.관리비}원</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </article>
            </section>



            {/* 추천물건 */}
            <section className='w-full relative bg-primary-yellow flexCol gap-y-4 py-10 px-2 overflow-hidden'>
                <h2 className='w-11/12 text-white'>추천물건</h2>
                <div className='absolute top-36 z-50 w-full flexRow justify-between px-1 mobile_1_bold'>
                    <div className="swiper-button-prev text-primary">
                        <FontAwesomeIcon icon={faChevronLeft}/>
                    </div> 
                    <div className="swiper-button-next  text-primary">
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </div> 
                </div>

                <Swiper
                    modules={[Navigation, Pagination, Scrollbar]}
                    // pagination={{ clickable: true }} // Show pagination dots
                    scrollbar={{ draggable: true }} // Enable draggable scrollbar
                    className='w-11/12'
                    breakpoints={{
                        // when window width is >= 640px
                        0: {
                            slidesPerView: 2, // 2 slides on mobile
                            spaceBetween: 10, // Smaller gap on mobile

                        },
                        // when window width is >= 1024px
                        1023: {
                            slidesPerView: 4, // 4 slides on desktop
                            spaceBetween: 20, // Smaller gap on mobile
                        },
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                >

                    {properties.map((property) => {
                        if(favoriteIds.includes(property.순번)){
                            const { 순번: propertyId } = property; // Assuming '순번' is the unique property ID
                            const images = propertyImages[propertyId] || []; // Get images for this property
    
                            return (
                                <SwiperSlide key={propertyId}>
                                    <article 
                                        className='flexCol justify-between gap-y-4  bg-white rounded-3xl px-2 py-3 mb-6'
                                        onClick={() => handleItemClick(property.순번)} // Handle item click
                                    >
                                        {/* Property Images */}
                                        {images.length > 0 ? (
                                            <div
                                                style={{
                                                    backgroundImage: `url(http://localhost:8000${images[0]})`,
                                                }}
                                                className='w-full aspect-square bg-cover bg-center rounded-2xl flex justify-end p-2'
                                            >
                                                <FontAwesomeIcon icon={faHeart} className='text-primary-yellow border p-2 rounded-full' />
                                            </div>
                                        ) : (
                                            <p className='bg-secondary-light text-center py-4 rounded-lg'>No images available</p>
                                        )}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the handleItemClick from being triggered
                                                heartClick(propertyId); // Call the heartClick function
                                            }}                                
                                            className='absolute top-5 right-3 z-40'
                                        >
                                          <FontAwesomeIcon icon={faRegularHeart} className='absolute top-0 right-0 text-primary border border-white p-1 rounded-full mobile_5'/>
                                        {favoriteIds.includes(propertyId) ? (
                                            <FontAwesomeIcon icon={faSolidHeart} className='absolute top-0 right-0 p-1 border border-white p-1 rounded-full mobile_5 text-primary-yellow' />
                                        ) : ""}
                                    </div>
                                        {/* Property Details */}
                                        <div className='flexCol items-start w-full gap-y-4'>
                                            <div className='flexCol items-start gap-y-2 '>
                                                <p className='mobile_1_bold'>
                                                    {property.거래방식} &nbsp;
                                                    {property.거래방식 === "매매"? formatToKoreanCurrency(property.보증금) : property.보증금/property.월세}
                                                </p>
                                                <p className='mobile_3'>{property.건물명}</p>
                                            </div>
                                            <ul className='flexRow gap-x-1 mobile_5 text-secondary'>
                                                <li>{property.전체평}평형 •</li>
                                                <li>{property.담당자}</li>
                                            </ul>
                                        </div>
                                    </article>
                                </SwiperSlide>
                            );
                        }   
                    })}
                </Swiper>

                <Memo/>
            </section>
        </main>
    );
};

export default Search;