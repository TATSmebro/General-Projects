import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { approvers, statusTypes } from "./filterData";

// Import custom hooks for StaticDataQueries
import { useDepartments, useFormTypes, useStatusTypes, usePurposesOfTravel, useApprovers } from "../../../queryFunctions/StaticDataQueries";

export default function FiltersModal({
    view, 
    setFilterView, 
    setFilterValues, 
    setCurrentPage, 
    dateRangeStart, 
    dateRangeEnd, 
    dateType, 
    status, 
    setStatusValue,
    setActiveFilter
}) {

    const { data: departments, isPending: departmentsLoading, isError: departmentsError } = useDepartments();
    const { data: formTypes, isPending: formTypeLoading, isError: formTypeError } = useFormTypes();
    const { data: purposes, isPending: purposesLoading, isError: purposesError } = usePurposesOfTravel();
    // const { data: statusTypes, isPending: statusTypeLoading, isError: statusTypeError } = useStatusTypes();
    // const { data: approvers, isPending: approversLoading, isError: approversError, refetch: refetchApprovers } = useApprovers(false);

    // Filter useForm
    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            requestor: '',
            requested_for: '',
            department: '',
            form_type: '',
            status: status || '',
            purpose: '',
            submitted_start: '',
            submitted_end: '',
            departure_city: '',
            departure_start: '',
            departure_end: '',
            return_city: '',
            return_start: '',
            return_end: '',
            start_business_start: '',
            start_business_end: '',
            end_business_start: '',
            end_business_end: '',
            approved_by: ''
        }
    })

    // Autofill date fields when props change
    useEffect(() => {
        // Helper to clear all date fields
        const clearAllDateFields = () => {
            setValue('submitted_start', '');
            setValue('submitted_end', '');
            setValue('departure_start', '');
            setValue('departure_end', '');
            setValue('return_start', '');
            setValue('return_end', '');
            setValue('start_business_start', '');
            setValue('start_business_end', '');
            setValue('end_business_start', '');
            setValue('end_business_end', '');
        };

        if (dateType && (dateRangeStart || dateRangeEnd)) {
            clearAllDateFields();
            if (dateType === 'submitted') {
                console.log("Setting submitted date fields");
                setValue('submitted_start', dateRangeStart ? dateRangeStart.toLocaleDateString('en-CA') : '');
                setValue('submitted_end', dateRangeEnd ? dateRangeEnd.toLocaleDateString('en-CA') : '');
                setCurrentPage(1);
            } else if (dateType === 'departure') {
                console.log("Setting departure date fields");
                setValue('departure_start', dateRangeStart ? dateRangeStart.toLocaleDateString('en-CA') : '');
                setValue('departure_end', dateRangeEnd ? dateRangeEnd.toLocaleDateString('en-CA') : '');
                setCurrentPage(1);
            } else if (dateType === 'return') {
                console.log("Setting return date fields");
                setValue('return_start', dateRangeStart ? dateRangeStart.toLocaleDateString('en-CA') : '');
                setValue('return_end', dateRangeEnd ? dateRangeEnd.toLocaleDateString('en-CA') : '');
                setCurrentPage(1);
            } else if (dateType === 'business_start') {
                console.log("Setting start business date fields");
                setValue('start_business_start', dateRangeStart ? dateRangeStart.toLocaleDateString('en-CA') : '');
                setValue('start_business_end', dateRangeEnd ? dateRangeEnd.toLocaleDateString('en-CA') : '');
                setCurrentPage(1);
            } else if (dateType === 'business_end') {
                console.log("Setting end business date fields");
                setValue('end_business_start', dateRangeStart ? dateRangeStart.toLocaleDateString('en-CA') : '');
                setValue('end_business_end', dateRangeEnd ? dateRangeEnd.toLocaleDateString('en-CA') : '');
                setCurrentPage(1);
            }
        } else if (!dateRangeStart && !dateRangeEnd) {
            // If both dates are cleared, clear all date fields
            clearAllDateFields();
            setCurrentPage(1);
        }
    }, [dateRangeStart, dateRangeEnd, dateType, setValue, setCurrentPage]);

    useEffect(() => {
        if (status){
            setValue("status", status);
        }
    }, [status, setValue]);


    const resetValues = () => {
        reset()
        setValue("status", '');
    }

    const submitValues = (values) => {
        setFilterValues(values);  // Update the filters from the modal
        setStatusValue(values.status);  // Update the status
        setActiveFilter(values.status);
        setCurrentPage(1);  // Reset to the first page

        // setFilterView(false);  // Close the modal
        console.log(values);
        
    }

    return ( 
        <Modal show={view} size="lg" centered>
            <Modal.Header className="border-bottom-0">
                <button type='button' className="hover-underline d-flex align-items-center p-0" onClick={()=>setFilterView(false)}>
                    <i className="bi bi-chevron-left" style={{ fontSize: '18px', color: '#EE9337' }}></i>
                    <span style={{ color: '#EE9337', fontSize: '14px' }}>Back</span>
                </button>
            </Modal.Header>
            <Modal.Body className="mt-0 mb-2">
                <div>
                    <Form onSubmit={handleSubmit(submitValues)}>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Requestor Name</Form.Label>
                                    <Form.Control {...register("requestor")} type="text" placeholder="Name of Requestor"/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Requested For</Form.Label>
                                    <Form.Control {...register("requested_for")} type="text" placeholder="Name of Flier"/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Department</Form.Label>
                                    <Form.Select {...register("department")}>
                                        <option value=''>Select Department</option>                                
                                        {
                                            departmentsLoading ? (
                                                <option value='' disabled>Loading Options...</option>
                                            ) : departmentsError ? (
                                                <option value='' disabled>Error Loading Departments</option>
                                            ) : (
                                                departments?.map(item => 
                                                <option value={item.department_name}>{item.department_name}</option>        
                                                )
                                            )
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Form Type</Form.Label>
                                    <Form.Select {...register("form_type")}>
                                        <option value=''>Select Form Type</option>
                                        {
                                            formTypeLoading ? (
                                                <option value='' disabled>Loading Options...</option>
                                            ) : formTypeError ? (
                                                <option value='' disabled>Error Loading Form Types</option>
                                            ) : (
                                                formTypes?.map(item => 
                                                    <option value={item.form_name}>{item.form_name}</option>        
                                                )
                                            )
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Status</Form.Label>
                                    <Form.Select {...register("status")}>
                                        <option value=''>Select Status</option>                                        
                                        {
                                            statusTypes?.map(item => 
                                                <option value={item.name}>{item.name}</option>
                                            )
                                        }
                                        {/* {
                                            statusTypeLoading ? (
                                                <option value='' disabled>Loading Options...</option>
                                            ) : statusTypeError ? (
                                                <option value='' disabled>Error Loading Status Types</option>
                                            ) : (
                                                statusTypes?.map(item => 
                                                <option value={item.status_name}>{item.status_name}</option>        
                                                )
                                            )
                                        } */}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Purpose of Travel</Form.Label>
                                    <Form.Select {...register("purpose")}>
                                        <option value=''>Select Purpose</option>                                        
                                        {
                                            purposesLoading ? (
                                                <option value='' disabled>Loading Options...</option>
                                            ) : purposesError ? (                            
                                                <option value='' disabled>Error Loading Purposes</option>
                                            ) : (
                                                purposes?.map(item => 
                                                    <option value={item.purpose_name}>{item.purpose_name}</option>        
                                                )
                                            )
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3 text-center">
                                    <Form.Label className='filter-form-label'>Date Submitted</Form.Label>
                                    <Row>
                                        <Col>
                                            <Form.Control {...register("submitted_start")} type="date"/>
                                        </Col>
                                        <Col>
                                            <Form.Control {...register("submitted_end")} type="date"/>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Departure</Form.Label>
                                        <Form.Control {...register("departure_city")} className="mb-1" type="text" placeholder="Enter City"/>
                                        <Form.Control {...register("departure_start")} className="mb-1" type="date" placeholder="Start Range"/>
                                        <Form.Control {...register("departure_end")} className="mb-1" type="date" placeholder="End Range"/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='filter-form-label'>Return</Form.Label>
                                        <Form.Control {...register("return_city")} className="mb-1" type="text" placeholder="Enter City"/>
                                        <Form.Control {...register("return_start")} className="mb-1" type="date" placeholder="Start Range"/>
                                        <Form.Control {...register("return_end")} className="mb-1" type="date" placeholder="End Range"/>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3 text-center">
                                    <Form.Label className='filter-form-label'>Start Date of Business</Form.Label>
                                    <Row>
                                        <Col>
                                            <Form.Control {...register("start_business_start")} type="date" placeholder="Start Range"/>
                                        </Col>
                                        <Col>
                                            <Form.Control {...register("start_business_end")} type="date" placeholder="End Range"/>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3 text-center">
                                    <Form.Label className='filter-form-label'>End Date of Business</Form.Label>
                                    <Row>
                                        <Col>
                                            <Form.Control {...register("end_business_start")} type="date" placeholder="Start Range"/>
                                        </Col>
                                        <Col>
                                            <Form.Control {...register("end_business_end")} type="date" placeholder="End Range"/>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3 text-center">
                                    <Form.Label className='filter-form-label'>To be approved by</Form.Label>     
                                    <div key={`inline-radio`} className="mb-3">                                                
                                        {approvers?.map(item => (
                                            <Form.Check
                                                key={item.id} // Add a key to avoid React warnings
                                                {...register("approved_by")}
                                                inline
                                                label={item.name}
                                                value={item.name}
                                                type="radio"
                                            />
                                        ))}
                                    </div>                                                                                 
                                    {/* {
                                        approversLoading ? (                                            
                                            <p>Loading...</p>
                                        ) : approversError ? (
                                            <p>Error Loading Approvers</p>
                                        ) : (
                                            <div key={`inline-radio`} className="mb-3">                                                
                                                {approvers?.map(item => (
                                                    <Form.Check
                                                        key={item.id} // Add a key to avoid React warnings
                                                        {...register("approved_by")}
                                                        inline
                                                        label={item.approver_name}
                                                        value={item.approver_name}
                                                        type="radio"
                                                    />
                                                ))}
                                            </div>
                                        )
                                    } */}
                                </Form.Group>
                            </Col>
                        </Row>
                        <div>
                            <Row>
                                <Col className="text-end">
                                    <input className='btn-pill btn-pill--cancel ms-2' type='reset' onClick={resetValues} value='Clear'/>                            
                                    <button className='button-affirm ms-2' type='submit' onClick={()=>setFilterView(false)}>Apply</button>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </div>
            </Modal.Body>
        </Modal>

    );
}
