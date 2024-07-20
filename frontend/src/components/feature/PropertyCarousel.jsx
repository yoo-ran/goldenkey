// src/PropertyCarousel.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import "./carousel.css"

import propertyTypeImg01 from '../../assets/home/propertyType01.jpg';
import propertyTypeImg02 from '../../assets/home/propertyType02.jpg';
import propertyTypeImg03 from '../../assets/home/propertyType03.jpg';
import propertyTypeImg04 from '../../assets/home/propertyType04.jpg';

const initialPropertyType = [
    { type: "Studio / One-bed", typeDescrp: "View all rental listings for houses, villas, officetels, and apartments.", image: propertyTypeImg01 },
    { type: "Condo", typeDescrp: "Access actual transaction prices, detailed complex information", image: propertyTypeImg02 },
    { type: "Townhouse", typeDescrp: "From rental listings to sales", image: propertyTypeImg03 },
    { type: "Apartment", typeDescrp: "View various information and listings all at once.", image: propertyTypeImg04 },
];

const PropertyCarousel = () => {
    const [slides, setSlides] = useState(initialPropertyType);

    const nextSlide = () => {
        setSlides((prevSlides) => {
            const newSlides = [...prevSlides];
            const firstSlide = newSlides.shift();
            newSlides.push(firstSlide);
            return newSlides;
        });
    };

    const prevSlide = () => {
        setSlides((prevSlides) => {
            const newSlides = [...prevSlides];
            const lastSlide = newSlides.pop();
            newSlides.unshift(lastSlide);
            return newSlides;
        });
    };

    return (
        <div className="relative flex items-center border h-96 w-full">
            <button className="absolute right-[53%] z-50 p-2 text-white lg:text-xl" onClick={prevSlide}>
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className='carousel-container flex items-center w-full h-3/4'>
                {slides.map((item, id) => (
                    <div
                        key={id}
                        className={`slide relative w-1/3 h-full flex-shrink-0 bg-cover bg-center [&:nth-child(3)]:h-80`}
                        style={{
                            backgroundImage: `url(${item.image})`,
                            transform: `translateX(-${100 / slides.length * id}%)`,
                        }}
                    >
                        <div className="bg absolute bg-black w-full h-full bg-opacity-60"></div>
                        <div className="info hidden absolute bottom-0 left-0 w-1/2 z-50 bg-white bg-opacity-50 pl-4 py-3">
                            <button className='text-sm bg-navy text-white rounded-full px-3 py-1'>Learn More</button>
                            <p className="font-bold">{item.type}</p>
                            <span className="text-sm">From $1,408,900</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="absolute right-[12%] z-50 p-2 text-white lg:text-xl" onClick={nextSlide}>
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    );
};

export default PropertyCarousel;
