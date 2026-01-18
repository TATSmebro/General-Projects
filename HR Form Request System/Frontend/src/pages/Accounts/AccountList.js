import { ReactComponent as EditIcon } from '../../assets/EditIcon.svg';
import { Spinner } from 'react-bootstrap';

export default function AccountList({data, setEditView, setData, isLoading}) {

    const handleEdit = (item) => {
        setData(item);
        setEditView(true);
    }

    var fixedCol = true;

    return (
        <div className='accounts-table'>
            <table className="table table-hover flex">
                    <thead>
                        <tr>
                            <th scope="col" style={ fixedCol ? { width: "200px" } : {}}>Full Name</th>
                            <th scope="col" style={ fixedCol ? { width: "400px" } : {}}>Email</th>
                            <th scope="col" style={ fixedCol ? { width: "150px" } : {}}>Phone No.</th>
                            <th scope="col" style={ fixedCol ? { width: "180px" } : {}}>Username</th>
                            <th scope="col" style={ fixedCol ? { width: "200px" } : {}}>Department</th>
                            <th scope="col" style={ fixedCol ? { width: "110px" } : {}}>Role</th>
                            <th style={ fixedCol ? { width: "36px" } : {}}></th>
                        </tr>
                    </thead>
                    { isLoading ||
                        <tbody>
                            {data?.map((item, idx) => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.first_name + " " + item.last_name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.username}</td>
                                        <td>{item.department_name}</td>
                                        <td>{item.role_name}</td>
                                        <td>
                                            <EditIcon onClick={() => handleEdit(item)} width={20} height={20} className="btn-edit" />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    }
                </table>
                { isLoading &&
                    <div className='d-flex justify-content-center align-items-center spinner-container'>
                        <Spinner animation="border" variant="secondary" />
                    </div>
                }
        </div>
        
    );
};