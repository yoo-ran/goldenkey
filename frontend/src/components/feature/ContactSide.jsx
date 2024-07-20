// src/PropertyCarousel.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';


const ContactSide = () => {

    return (
        <div className="relative flexCol justify-between border h-full w-full rounded-xl p-4">
            <h4 className='font-bold text-lg'>Contact Pro Agent</h4>
            <form action=""
                className='flexCol gap-y-6'
            >
                <div className='w-full'>
                    <label htmlFor="">Full Name</label>
                    <input type="text" 
                        className='bg-darkGray border border-gray-300 rounded w-full py-1 px-2'
                    />
                </div>
                <div className='w-full'>
                    <label htmlFor="">Email</label>
                    <input type="email" 
                        className='bg-darkGray border border-gray-300 rounded w-full py-1 px-2'
                    />
                </div>
                <div className='w-full'>
                    <label htmlFor="">Phone</label>
                    <input type="phone" 
                        className='bg-darkGray border border-gray-300 rounded w-full py-1 px-2'
                    />
                </div>
                <div className='w-full'>
                    <label htmlFor="">Message</label>
                    <input type="text" placeholder='Please Send me information' 
                        className='bg-darkGray border border-gray-300 rounded w-full py-1 px-2 placeholder:text-black text-sm'
                    />
                </div>
                <div className='flexCol gap-y-2 w-full'>
                    <button className='rounded w-full py-2 text-sm bg-yellow'>Request Info</button>
                    <button className='rounded w-full py-2 text-sm border border-black'>Contact Sales Center</button>
                </div>
           </form>
        </div>
    );
};

export default ContactSide;
