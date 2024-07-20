import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';


const ListingHeader = ({ onSendType }) => {
    const [selectedType, setSelectedType] = useState("House")
    const sendData = (e) => {
        onSendType(e.target.innerText);
        setSelectedType(e.target.innerText)
    };

    return (
        <div className="w-full">
            {/* Property Type */}
            <section className='border-y-2 border-yellow flexRow pt-6 w-full'>
                <article className='flexRow justify-start text-yellow lg:gap-x-14 w-10/12 '>
                    <button onClick={sendData} className={`rounded-t-xl p-3 transition-all hover:bg-yellow hover:text-white ${selectedType === "House"? "bg-yellow text-white" :"bg-transparent text-yellow"}`}>House</button>
                    <button onClick={sendData} className={`rounded-t-xl p-3 transition-all hover:bg-yellow hover:text-white ${selectedType === "Condo"? "bg-yellow text-white" :"bg-transparent text-yellow"}`}>Condo</button>
                    <button onClick={sendData} className={`rounded-t-xl p-3 transition-all hover:bg-yellow hover:text-white ${selectedType === "Townhouse"? "bg-yellow text-white" :"bg-transparent text-yellow"}`}>Townhouse</button>
                    <button onClick={sendData} className={`rounded-t-xl p-3 transition-all hover:bg-yellow hover:text-white ${selectedType === "Apartment"? "bg-yellow text-white" :"bg-transparent text-yellow"}`}>Apartment</button>
                    <button onClick={sendData} className={`rounded-t-xl p-3 transition-all hover:bg-yellow hover:text-white ${selectedType === "Land"? "bg-yellow text-white" :"bg-transparent text-yellow"}`}>Land</button>
                </article>
            </section>

            {/* Filter */}
            <section className='mb-20'>
                <article>
                    <select name="cars" className='border rounded-full px-3'>
                        <option value="sale">For Sale</option>
                        <option value="saab">Saab</option>
                        <option value="opel">Opel</option>
                        <option value="audi">Audi</option>
                    </select>
                </article>
            </section>
        </div>
    );
};

export default ListingHeader;
