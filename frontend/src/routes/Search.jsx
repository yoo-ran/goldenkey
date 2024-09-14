// src/components/User.jsx
import {useEffect, useState } from "react";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';



const Search = () => {
    const [properties, setProperties] = useState([]);
    const [propertyImages, setPropertyImages] = useState({}); // Store images by property ID
    const location = useLocation(); // Retrieve the state (data) from navigation
    const rangeValues = location.state || {
        selectedMethod: '',
        depositRange: { min: 0, max: 3000 },
        rentRange: { min: 0, max: 150 },
        roomSizeRange: { min: 0, max: 1000 },
        거래방식: '',
        거래완료여부: '',
    }; // Fallback to an empty object if no state is provided
    
    console.log(rangeValues);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:8000/listing');
                const propertyList = response.data;
                setProperties(propertyList);
        
                // Fetch images for each property
                for (const property of propertyList) {
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

    const filterProperties = properties.filter((property) => {
        const withinDepositRange =
          property.보증금 >= rangeValues.depositRange.min &&
          property.보증금 <= rangeValues.depositRange.max;
    
        const withinRentRange =
          property.월세 >= rangeValues.rentRange.min &&
          property.월세 <= rangeValues.rentRange.max;
    
        const withinRoomSizeRange =
          property.전용m2 >= rangeValues.roomSizeRange.min &&
          property.전용m2 <= rangeValues.roomSizeRange.max;

        const matchesSelectedMethod =
        property.거래방식 === rangeValues.selectedMethod || rangeValues.selectedMethod === 'all';

        return withinDepositRange && withinRentRange && withinRoomSizeRange && matchesSelectedMethod;
      });

    return (
        <main className='w-full gap-y-16'>
            <section>
                subheader
            </section>

            {/* 검색결과 */}
            <section className='w-11/12 flexCol gap-y-4'>
                <h2 className='w-full'>{filterProperties.length > 0 ? filterProperties.length : properties.length}개의 검색결과</h2>
                <article className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8'>

                {(filterProperties.length > 0 ? filterProperties : properties).map((property) => {                        
                    const { 순번: propertyId } = property; // Assuming '순번' is the unique property ID
                        const images = propertyImages[propertyId] || []; // Get images for this property

                        return (
                            <div 
                                key={propertyId}
                                className='flexRow gap-x-4 lg:flexCol gap-y-4'
                            >
                                <div className="w-4/12 lg:w-full flexCol">
                                    {images.length > 0 ? (
                                        <img
                                            src={`http://localhost:8000${images[0]}`}
                                            alt={`Property Image 1`}
                                            className=" object-cover lg:rounded-4xl"
                                        />
                                    ) : (
                                        <p>No images available</p>
                                    )}
                                </div>
                                <div className='flexCol items-start w-8/12 gap-y-4 lg:w-11/12'>
                                    {/* <p className='mobile_1_bold'>{property.거래방식}</p> */}
                                    <p className='mobile_1_bold'>{property.거래방식} {property.보증금}/{property.월세}</p>
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
            <section className='w-full  bg-primary-yellow flexCol gap-y-4 py-10 pl-2'>
                <h2 className='w-11/12 text-white'>추천물건</h2>

                <article className='w-11/12 flexRow gap-x-4'>
                    {properties.slice(0,4).map((property) => {
                        const { 순번: propertyId } = property; // Assuming '순번' is the unique property ID
                        const images = propertyImages[propertyId] || []; // Get images for this property

                        return (
                            <div 
                                key={propertyId}
                                className='flexCol justify-between gap-y-4 w-full bg-white rounded-3xl px-3 pt-3'
                            >
                                {images.length > 0 ? (
                                    <div
                                        style={{
                                            backgroundImage: `url(http://localhost:8000${images[0]})`, // Corrected syntax
                                        }}                                
                                        className='w-full aspect-square bg-cover bg-center rounded-2xl flex justify-end pt-2 pr-2'        
                                    >
                                        <FontAwesomeIcon icon={faHeart} className='text-primary-yellow'/>
                                    </div>
                                ) : (
                                    <p>No images available</p>
                                )}
                                <div className='flexCol items-start w-full gap-y-4'>
                                    <div className='flexCol items-start gap-y-2 mobile_1_bold'>
                                        <p className=''>{property.거래방식}</p>
                                        <li>{property.건물명}</li>
                                    </div>
                                    <ul className='flexRow gap-x-1 mobile_5 text-secondary'>
                                        <li>{property.전체m2}m<sup>2</sup>,</li>
                                        <li>{property.담당자}</li>
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </article>
            </section>
        </main>
    );
};

export default Search;