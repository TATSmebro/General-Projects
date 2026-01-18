import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainContainer from '../../components/MainContainer';

// Components
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination'; // Assuming you have a Pagination component
import RequestList from './RequestList'; // Assuming you have a RequestList component
import FilterPanels from './FilterPanel'; // Assuming you have a FilterPanel component
import Calendar from './Calendar';

// Popup Modal
import FiltersModal from './components/FiltersModal.js';
import FormsModal from './components/FormsModal.js';

// Import filterData function
import filterData from './components/FilterFunction.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Dummy Data
import dummyData from './dummyData';

function Home() {
    // Forms and Filters Modal
    const [formsView, setFormsView] = useState(false)
    const [filterView, setFilterView] = useState(false)

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 10;
    
    // State for filter and search values
    const [filterValues, setFilterValues] = useState();
    const [searchValue, setSearchValue] = useState('');
    
    // Filter the request based on filterValues + searchValue
    const filteredData = dummyData
    .filter(item => filterData(item, filterValues))
    .filter(item =>!searchValue || item.subject.toLowerCase().includes(searchValue.toLowerCase()));

    const totalPages = Math.ceil(filteredData.length / requestsPerPage);

    // Paginate the requests based on the current page [0-10] Requests for page 1, [10-20] Requests for page 2, etc.
    const paginatedRequests = filteredData.slice(
        (currentPage - 1) * requestsPerPage,
        currentPage * requestsPerPage
    );

    // Calendar Date Ranges
    const [dateRange, setDateRange] = useState([null, null]);
    const [dateType, setDateType] = useState('');

    // Filter Status
    const [statusValue, setStatusValue] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    const handleFilterButtonClick = (status) => {
        setStatusValue(status);
        setFilterValues(prev => ({
            ...prev,
            status: status // Update status when a button is clicked
        }));
        setCurrentPage(1); // Reset to the first page
    };   
    
    return (
    <MainContainer>
        <div className="row h-100 m-0">
            {/* Left Side */}
            <div className="p-4 col-md-3 col-lg-2 h-100 overflow-auto" style={{width: '30%',display: 'flex', flexDirection: 'column', borderRight: '5px solid var(--tforange-color)'}}>
                <Calendar setDateRange={setDateRange} setFilterValues={setFilterValues} setDateType={setDateType} dateRange={dateRange}/>
            </div>

            {/* Right Content */}
            <div className="p-4 h-100 overflow-auto " style={{width: '70%',display: 'flex',flexDirection: 'column',}}>
             
                {/* Filters */}
                <FilterPanels activeFilter={activeFilter} setActiveFilter={setActiveFilter} statusValue={statusValue} handleFilterButtonClick={handleFilterButtonClick}/>

                {/* <div className='mb-3 d-flex gap-2'>
                    {["","Pending", "Approved", "Rejected", "Requests this Month"].map((status) => (
                        <button key={status}          
                                className={`btn ${statusValue === status ? 'btn-warning' : 'btn-outline-warning'}`}
                                onClick={() => handleFilterButtonClick(status)}>
                                {status}
                        </button>
                    ))
                    }
                </div> */}

                {/* Header - Requests + Searchbar + Filter */}
                <div
                    className="d-flex justify-content-between align-items-center pb-3"
                    style={{ borderBottom: '2px solid #C8C8C8' }}
                    >
                    <h2 className="tf-header">Requests</h2>
                    <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                        <SearchBar setSearchValue={setSearchValue} setCurrentPage={setCurrentPage}/>

                        {/* Filter Button */}
                        <button
                            type="button"
                            onClick={() => setFilterView(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                margin: 0,
                                cursor: 'pointer',
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                position: 'relative',
                            }}
                            className="hover-underline"
                            >
                            <span style={{ color: '#555', fontSize: '14px' }}>Filter by</span>
                            <i className="bi bi-filter" style={{ fontSize: '18px', color: '#555' }}></i>
                        </button>
                        
                        {/* Modals */}
                        <FormsModal view={formsView} setFormsView={setFormsView} />
                    
                        <FiltersModal 
                            view={filterView} 
                            setFilterView={setFilterView} 
                            setFilterValues={setFilterValues} 
                            setCurrentPage={setCurrentPage} 
                            dateRangeStart={dateRange[0]} 
                            dateRangeEnd={dateRange[1]} 
                            dateType={dateType}
                            status={statusValue}
                            setStatusValue={setStatusValue}
                            setActiveFilter={setActiveFilter}
                        />
                        
                    </div>
                </div>

                <RequestList data={paginatedRequests} />

                <div className="border-black  d-flex justify-content-center" style={{ padding: 5, marginTop: 'auto'}}>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
                </div>

            </div>
        </div>

        {/* Floating Action Button */}
        <button className="add-btn position-fixed" onClick={() => setFormsView(true)} style={{bottom: '20px', right: '20px'}}>
            <FontAwesomeIcon icon={faPlus}/>
            <span>Submit New Form</span>
        </button>
    </MainContainer>
    );
}

export default Home;
