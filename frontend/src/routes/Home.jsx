// src/components/Home.jsx
import {useEffect, useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

import Login from '../components/Login';
import Signup from '../components/Signup';

import PropertyCarousel from '../components/feature/PropertyCarousel';

import Images from '../components/feature/importImg'; // Import the custom Image component

const propertyType = [
    {type:"Studio / One-bed", typeDescrp:"View all rental listings for houses, villas, officetels, and apartments."},
    {type:"Condo", typeDescrp:"Access actual transaction prices, detailed complex information"},
    {type:"Townhouse", typeDescrp:"From rental listings to sales"},
    {type:"Apartment", typeDescrp:"View various information and listings all at once."},
    {type:"Room Rental", typeDescrp:"Check all sale and move-in information"},
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
        <main className='gap-y-32'>
            {/* Banner */}
            <section className='w-full'>
                <article
                    style={{ backgroundImage: `url(${Images[0]})` }}
                    className='relative flexRow w-full lg:h-96 bg-cover bg-center'
                >   
                    <div className='absolute bg-black w-full h-full bg-opacity-40'></div>
                    <div className='flexRow   bg-yellow text-white z-50 gap-x-4 lg:w-5/12 rounded-3xl lg:py-4 lg:px-4'>
                        <FontAwesomeIcon icon={faSearch} />
                        <input type="search" placeholder='Search by region, university, complex name, or listing number.'
                            className='bg-transparent block w-10/12 placeholder:text-white'/>
                    </div>
                </article>
            </section>

            {/* Property Type */}
            <section className='w-full flexRow'>
                <article className='flexRow justify-between gap-x-4 lg:w-10/12 h-56'>
                {propertyType.map((item, id) => (
                    <div
                        key={id}
                        style={{ backgroundImage: `url(${Images[id]})` }}
                        className="relative overflow-hidden flexRow w-1/5 lg:h-48 bg-cover bg-center rounded-3xl"
                    >
                        <div className="absolute bg-black w-full h-full bg-opacity-50"></div>
                        <div className="border-l-2 pl-2 border-yellow w-10/12 z-50 h-1/2 flexCol justify-between items-start">
                            <p className="text-yellow font-bold">{item.type}</p>
                            <span className="text-white text-sm">{item.typeDescrp}</span>
                        </div>
                    </div>
                ))}
                </article>
            </section>

            {/* Recommend House */}
            <section className='flexCol lg:gap-y-10 w-full'>
                <h2 className='w-10/12 capitalize'>Recommend Houses Near You</h2>
                <article className='flexRow w-full bg-yellow h-96'>
                        <PropertyCarousel/>
                </article>
            </section>

            {/* Suitable House */}
            <section className='flexCol lg:gap-y-10 w-10/12'>
                <h2 className='w-full capitalize'>Properties suitable for you</h2>
                <article className='w-full flexRow gap-x-4'>
                {properties
                    .filter((item) => item.pId <= 4)
                    .map((item) => (
                        <div key={item.pId} className='lg:w-1/4'>
                            <img 
                                src={Images[item.pId % Images.length]} 
                                alt={`Listing ${item.pId}`} 
                                className='rounded-2xl h-48 w-full object-cover object-center'
                            />
                            <div className='py-4'> 
                                <p className='font-bold'>{item.name}</p>
                                <p>From {item.price} CAD</p>
                                <span className='text-yellow'>{item.address}</span>
                            </div>
                        </div>
                    ))
                }
                </article>
            </section>
        </main>
    );
};

export default Home;
