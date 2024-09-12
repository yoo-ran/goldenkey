// src/components/User.jsx
import {useEffect, useState } from "react";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';


const Search = () => {
    const [properties, setProperties] = useState([]);
    const [propertyImages, setPropertyImages] = useState({}); // Store images by property ID


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
    const transactionMethod = () => {
        return "매매 8억 6천"
    }

    return (
        <main className='w-full gap-y-16'>
            <section>
                subheader
            </section>

            {/* 검색결과 */}
            <section className='w-11/12 flexCol gap-y-4'>
                <h2 className='w-full'>{properties.length}개의 검색결과</h2>
                <article className='w-full flexCol gap-y-4'>

                    {properties.slice(0,6).map((property) => {
                        const { 순번: propertyId } = property; // Assuming '순번' is the unique property ID
                        const images = propertyImages[propertyId] || []; // Get images for this property

                        return (
                            <div 
                                key={propertyId}
                                className='flexRow gap-x-4'
                            >
                                <div className="w-4/12 flexCol">
                                    {images.length > 0 ? (
                                        <img
                                            src={`http://localhost:8000${images[0]}`}
                                            alt={`Property Image 1`}
                                            className=" object-cover"
                                        />
                                    ) : (
                                        <p>No images available</p>
                                    )}
                                </div>
                                <div className='flexCol items-start w-8/12 gap-y-4'>
                                    <p className='mobile_1_bold'>{transactionMethod()}</p>
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
                    {properties.slice(0,2).map((property) => {
                        const { 순번: propertyId } = property; // Assuming '순번' is the unique property ID
                        const images = propertyImages[propertyId] || []; // Get images for this property

                        return (
                            <div 
                                key={propertyId}
                                className='flexCol justify-between w-44 h-72 bg-white rounded-3xl px-3 pt-3'
                            >
                                {images.length > 0 ? (
                                    <div
                                        style={{
                                            backgroundImage: `url(http://localhost:8000${images[0]})`, // Corrected syntax
                                        }}                                
                                        className='w-full h-full bg-cover bg-center rounded-2xl flex justify-end pt-2 pr-2'        
                                    >
                                        <FontAwesomeIcon icon={faHeart} className='text-primary-yellow'/>
                                    </div>
                                    // <img
                                    //     src={`http://localhost:8000${images[0]}`}
                                    //     alt={`Property Image 1`}
                                    //     className="w-full aspect-square object-cover rounded-2xl"
                                    // />
                                ) : (
                                    <p>No images available</p>
                                )}
                                <div className='flexCol items-start h-full w-full gap-y-4'>
                                    <div className='flexCol items-start gap-y-2 mobile_1_bold'>
                                        <p className=''>{transactionMethod()}</p>
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