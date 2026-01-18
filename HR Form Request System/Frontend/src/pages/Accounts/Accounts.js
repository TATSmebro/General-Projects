import { useState, useEffect } from "react";
import MainContainer from "../../components/MainContainer";

// components
import SearchBar from "../../components/SearchBar";
import Pagination from '../../components/Pagination';
import AccountList from "./AccountList";
import RegisterForm from './components/RegisterForm';
import EditForm from "./components/EditForm";

// API
import UserCredentialsAPI from "../../api/UserCredentialsAPI";

export default function Accounts(){

    const [formView, setFormView] = useState(false);
    const [editView, setEditView] = useState(false);

    const [accounts, setAccounts] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState(false);
    const [refresh, setRefresh] = useState(true);
    
    const openFormView = () => {
        setFormView(true);
    }

    const getAllAccounts = async() => {
        const response = await new UserCredentialsAPI().getAllUserCredentials()
        if (response?.ok) {
            setAccounts(response.data)
            setRefresh(false)
            setIsLoading(false)
        } else console.log(response.statusMessage)
    }

    useEffect(() => {
        if (refresh) {
            getAllAccounts()
        }
    }, [refresh])

    // State for role and search
    const [searchValue, setSearchValue] = useState('');
    const [role, setRole] = useState();

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 10;

    // Filter Accounts Data
    const filteredAccounts = accounts?.filter(item => role ? item.role_name===role : item.role_name).filter(item => {
        const fullname = `${item.first_name} ${item.last_ame}`;
        return !searchValue || fullname?.toLowerCase().includes(searchValue.toLowerCase()) || item.department?.toLowerCase().includes(searchValue.toLowerCase())
    });

    const totalPages = Math.ceil(filteredAccounts?.length / requestsPerPage);

    const paginatedRequests = filteredAccounts?.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
    );

    const handleSubmitRole = (selectedRole) => {
        setCurrentPage(1); // Reset to first page when role changes
        setRole(selectedRole);
    }

    return (
        <MainContainer>
            <div className="mx-5 my-2">
                <h1 className="tf-header">Account Management</h1>
                
                <div className="d-flex justify-content-between mb-3">
                    <div>
                        <button onClick={()=>handleSubmitRole()} className={`btn-role ${!role ? "btn-role--selected" : ""}`}>All</button>
                        <button onClick={()=>handleSubmitRole("HR")} className={`btn-role ${role==="HR" ? "btn-role--selected" : ""}`}>HR</button>
                        <button onClick={()=>handleSubmitRole("Employee")} className={`btn-role ${role==="Employee" ? "btn-role--selected" : ""}`}>Employee</button>
                    </div>
                    <SearchBar setSearchValue={setSearchValue} setCurrentPage={setCurrentPage}/>
                </div>
                
                <AccountList data={paginatedRequests} setEditView={setEditView} setData={setData} isLoading={isLoading} />
                <EditForm view={editView} setEditView={setEditView} setRefresh={setRefresh} setIsLoading={setIsLoading} data={data} />

                <div className="border-black d-flex justify-content-center mb-0" style={{ padding: 5, marginTop: 'auto'}}>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
                </div>
            </div>

            <button onClick={openFormView} className="btn rounded-circle position-fixed" style={{ color:'white', bottom: '20px', right: '20px', width: '50px', height: '50px', fontSize: '24px', backgroundColor: 'var(--tforange-color)'}}>+</button>
            <RegisterForm view={formView} setFormView={setFormView} setRefresh={setRefresh} setIsLoading={setIsLoading} />
        
        </MainContainer>
    );
}