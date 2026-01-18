import { Form, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// API
import BookingDetailsAPI from "../api/BookingDetailsAPI";

export default function BookingForm({view, setFormView, preview, notes}) {
    
    let navigate = useNavigate();
    let id = 1;

    // Initialize form
    const { register, handleSubmit, reset, formState: { errors, isValid, isSubmitted, isSubmitSuccessful } } = useForm({
        defaultValues: {
            departure_ref_no: "",
            departure_cost: "",
            departure_ticket_path: "",
            return_ref_no: "",
            return_cost: "",
            return_ticket_path: "",
            notes: "",
        }
    })

    // Get booking details by id
    const getBookingDetails = async(id) => {
        const response = await new BookingDetailsAPI().getBookingDetails(id)
        if (response?.ok) {
            reset(response.data)
        } else console.log(response.statusMessage)
    }

    // Submit booking details
    const submitBookingDetails = async(values) => {
        const response = await new BookingDetailsAPI().addBookingDetails(values)
        if (response?.ok) {
            console.log("Booking Details submitted!")
        } else console.log(response.statusMessage)
    }

    // Load API on page load
    useEffect(() => {
        if (preview) getBookingDetails(id)
    }, [])
    
    // Add input notes on the form
    useEffect(() => {
        if (!isSubmitSuccessful && !preview) reset({ notes: notes });
    }, [view])

    // Reset form upon successful form submission
    useEffect(() => {
        reset();
    }, [isSubmitSuccessful])

    // Submit form
    const displayValues = (values) => {
        console.log(values);

        // Temporary fix for other booking details fields
        delete(values.notes)
        values.departure_ticket_path = '/sample.pdf'
        values.return_ticket_path = '/sample.pdf'

        submitBookingDetails(values);

        setFormView(false);
        navigate("/");
    }

    return (
        <Form onSubmit={handleSubmit(displayValues)}>
            <div className="tf-form-title mt-2 mb-4">
                <h1 className="tf-header text-black">Booking Details</h1>
            </div>

            <fieldset disabled={preview}>

                {/* Request Details */}
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className='fr-form-label'>Employee Name</Form.Label>
                            <Form.Control disabled type="text" placeholder="Full Name"/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className='fr-form-label'>Request ID</Form.Label>
                            <Form.Control disabled type="text" placeholder="TFI250630"/>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Depature Details */}
                <div className="tf-form-section">
                    <h2>Departure</h2>
                    <p>Departure Booking Details</p>
                </div>

                <Row>
                    {/* Booking Reference No. */}
                    <Col>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className='fr-form-label input-required'>Booking Reference No.</Form.Label>
                            <Form.Control type="text" placeholder="Reference No." className={`${errors.departure_ref_no ? "input-invalid" : ""}`} 
                                {...register("departure_ref_no", {
                                    required: "This field is required.",
                                    pattern : {
                                        value: /^[a-zA-Z0-9\s_\-']+$/,
                                        message: "Please enter a valid reference number."
                                    }
                            })}/>

                            {errors.departure_ref_no && 
                                <span className="error-msg">{errors.departure_ref_no.message}</span>
                            }
                        </Form.Group>
                    </Col>
                    {/* Cost */}
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className='fr-form-label input-required'>Cost</Form.Label>
                            <Form.Control type="number" placeholder="Php" className={`${errors.departure_cost ? "input-invalid" : ""}`} 

                                {...register("departure_cost", {
                                    required : "This field is required.",
                                    min: {
                                        value: 0,
                                        message: "PLease enter a valid cost."
                                    }
                            })}/>
                            
                            {errors.departure_cost && 
                                <span className="error-msg">{errors.departure_cost.message}</span>
                            }
                        </Form.Group>
                    </Col>
                </Row>

                {/* Ticket */}
                <Row>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className='fr-form-label input-required'>Ticket</Form.Label>
                        <Form.Control type="file" className={`${errors.departure_ticket_path ? "input-invalid" : ""}`} 
                            {...register("departure_ticket_path", {
                                required : "This field is required.",
                                validate: {
                                    fileType: (files) =>
                                        files[0]?.type === "application/pdf" || "File must be in PDF format.",
                                    fileSize: (files) =>
                                        files[0]?.size < 5 * 1024 * 1024 || "File must be under 5MB."
                                }
                        })}/>
                        
                        {errors.departure_ticket_path && 
                            <span className="error-msg">{errors.departure_ticket_path.message}</span>
                        }
                    </Form.Group>
                </Row>

                {/* Return Details */}
                <div className="tf-form-section">
                    <h2>Return</h2>
                    <p>Return Booking Details</p>
                </div>

                <Row>
                    {/* Booking Reference No. */}
                    <Col>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className='fr-form-label input-required'>Booking Reference No.</Form.Label>
                            <Form.Control type="text" placeholder="Reference No." className={`${errors.return_ref_no ? "input-invalid" : ""}`} 
                                {...register("return_ref_no", {
                                    required : "This field is required.",
                                    pattern : {
                                        value: /^[a-zA-Z0-9\s_\-']+$/,
                                        message: "Please enter a valid reference number."
                                    }
                            })}/>
                            
                            {errors.return_ref_no && 
                                <span className="error-msg">{errors.return_ref_no.message}</span>
                            }
                        </Form.Group>
                    </Col>
                    {/* Cost */}
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className='fr-form-label input-required'>Cost</Form.Label>
                            <Form.Control type="number" placeholder="Php"className={`${errors.return_cost ? "input-invalid" : ""}`} 
                                {...register("return_cost", {
                                    required : "This field is required.",
                                    min: {
                                        value: 0,
                                        message: "PLease enter a valid cost."
                                    }
                            })}/>
                            
                            {errors.return_cost && 
                                <span className="error-msg">{errors.return_cost.message}</span>
                            }
                        </Form.Group>
                    </Col>
                </Row>

                {/* Ticket */}
                <Row>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className='fr-form-label input-required'>Ticket</Form.Label>
                        <Form.Control type="file" className={`${errors.return_ticket_path ? "input-invalid" : ""}`} 
                            {...register("return_ticket_path", {
                                required : "This field is required.",
                                validate: {
                                    fileType: (files) =>
                                        files[0]?.type === "application/pdf" || "File must be in PDF format.",
                                    fileSize: (files) =>
                                        files[0]?.size < 5 * 1024 * 1024 || "File must be under 5MB."
                                }
                        })}/>
                        
                        {errors.return_ticket_path && 
                            <span className="error-msg">{errors.return_ticket_path.message}</span>
                        }
                    </Form.Group>
                </Row>

                {/* Notes */}
                <Form.Group className="mt-2 mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label className='fr-form-label input-optional'>Notes</Form.Label>
                    <Form.Control {...register("notes")} as="textarea" placeholder='Enter notes.'/>
                </Form.Group>
            </fieldset>
            
            {
                preview ||
                <div className="d-flex flex-column">
                    {/* Error box */}
                    { (!isValid && isSubmitted) && <div className="form-box form-box-error mb-3 w-100 d-flex align-items-center px-4 gap-4">
                        <i className="bi bi-exclamation-triangle-fill fs-1"/>
                        <p className='text-start m-0'>Please check if all required fields are filled and if all inputs are valid.</p>
                    </div> }

                    <div className="d-flex justify-content-between w-100">
                        <button className="button-neg" onClick={() => setFormView(false)}>Cancel</button>
                        <button type="submit" className='btn-review btn-review--approve'>Submit and Approve</button>
                    </div>
                </div>
            }
            
        </Form>
    )
}