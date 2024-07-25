import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';

import Images from '../components/feature/importImg'; // Import the custom Image component
import ListingHeader from '../components/feature/ListingHeader';

const Listing = () => {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); 
    const [selectedProperty, setSelectedProperty] = useState(null);
    const navigate = useNavigate();
    const [type, setType] = useState("House");

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:8000/listing');
                console.log(response);
                setProperties(response.data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    const handleData = (typeData) => {
        setType(typeData);
        console.log(typeData);
    };


    // Calculate the indices for slicing the properties array
    const filteredProperties = type ? properties.filter(item => item.type === type) : properties;

    const indexOfLastProperty = currentPage * itemsPerPage;
    const indexOfFirstProperty = indexOfLastProperty - itemsPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

    // Filter properties based on the selected type

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(properties.length / itemsPerPage)) {
            setCurrentPage(newPage);
        }
    };

    const handleItemClick = (property) => {
        setSelectedProperty(property);
        navigate(`/detail/${property.pId}`, { state: { property } });
    };

    return (
        <main className='gap-y-10 w-full'>
            
            <ListingHeader onSendType={handleData} />

            {/* List */}
            <section className='relative w-10/12 grid grid-cols-12 gap-x-4 gap-y-20 '>
                {currentProperties.map((item, id) => (
                    <div 
                        key={id} 
                        className='relative col-span-4 cursor-pointer p-2 border border-transparent rounded-xl hover:border-yellow'
                        onClick={() => handleItemClick(item)} // Handle item click
                    >
                        <img 
                            src={Images[id % Images.length]} 
                            alt={`Listing ${id}`} 
                            className='rounded-2xl w-full h-48 object-cover object-center' 
                        />
                        <button className='absolute top-3 right-4 text-lightBlack'>
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <div className='py-4'>
                            <p className='font-bold'>{item.name}</p>
                            <p className='py-3'>From {item.price.toLocaleString()} CAD</p>
                            <p className='text-navy font-light'>Maintenance fee | {item.maintenance.toLocaleString()} CAD</p>
                            <p className='text-navy font-light'>{item.bedroom} Bed {item.bathroom} Washroom | {item.sqft.toLocaleString()} SqFt</p>
                            <span className='text-yellow text-sm'>{item.type} | {item.address}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Pagination Controls */}
            <section className='flex justify-center mt-10'>
                <button 
                    className='text-navy hover:text-yellow'
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className='px-4'>{currentPage} of {Math.ceil(properties.length / itemsPerPage)}</span>
                <button 
                    className='text-navy hover:text-yellow'
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === Math.ceil(properties.length / itemsPerPage)}
                >
                    Next
                </button>
            </section>
        </main>
    );
};

export default Listing;
