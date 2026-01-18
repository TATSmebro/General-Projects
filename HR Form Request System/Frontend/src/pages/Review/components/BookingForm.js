import { Modal, Form, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

export default function BookingForm({view, setFormView, notes}) {

    const [preview, setPreview] = useState(false);
    const [formValues, setFormValues] = useState();

    const { register, handleSubmit, reset, setValue, formState: { errors, isValid, isSubmitted } } = useForm({
        defaultValues: {
            departureRef: "",
            departureCost: "",
            departureTicket: "",
            returnRef: "",
            returnCost: "",
            returnTicket: "",
            notes: "",
        }
    })
    
    const [inputNotes, setInputNotes] = useState(notes)

    const home = async () => {
        window.location.href = "/";
    }

    const displayValues = (values) => {
        console.log(values);
        setFormValues(values);
        setFormView(false);
        home();
    }

    useEffect(() => {
        reset();
    }, [view])

    return ( 
        <Modal show={view} size="lg" className="form-modal">
            <Modal.Body className="my-4">
                <div className="tf-form-title mt-2 mb-4">
                    {
                        preview ? 
                            <h1 className="tf-header text-black">Preview</h1> :
                            <h1 className="tf-header text-black">Booking Details</h1>
                    }
                </div>
                <Form onSubmit={handleSubmit(displayValues)}>
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
                                    <Form.Control type="text" placeholder="Reference No." className={`${errors.departureRef ? "input-invalid" : ""}`} 
                                        {...register("departureRef", {
                                            required: "This field is required.",
                                            pattern : {
                                                value: /^[a-zA-Z0-9\s_\-']+$/,
                                                message: "Please enter a valid reference number."
                                            }
                                    })}/>

                                    {errors.departureRef && 
                                        <span className="error-msg">{errors.departureRef.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                            {/* Cost */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Cost</Form.Label>
                                    <Form.Control type="number" placeholder="Php" className={`${errors.departureCost ? "input-invalid" : ""}`} 

                                        {...register("departureCost", {
                                            required : "This field is required.",
                                            min: {
                                                value: 0,
                                                message: "PLease enter a valid cost."
                                            }
                                    })}/>
                                    
                                    {errors.departureCost && 
                                        <span className="error-msg">{errors.departureCost.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Ticket */}
                        <Row>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label className='fr-form-label input-required'>Ticket</Form.Label>
                                <Form.Control type="file" className={`${errors.departureTicket ? "input-invalid" : ""}`} 
                                    {...register("departureTicket", {
                                        required : "This field is required.",
                                        validate: {
                                            fileType: (files) =>
                                                files[0]?.type === "application/pdf" || "File must be in PDF format.",
                                            fileSize: (files) =>
                                                files[0]?.size < 5 * 1024 * 1024 || "File must be under 5MB."
                                        }
                                })}/>
                                
                                {errors.departureTicket && 
                                    <span className="error-msg">{errors.departureTicket.message}</span>
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
                                    <Form.Control type="text" placeholder="Reference No." className={`${errors.returnRef ? "input-invalid" : ""}`} 
                                        {...register("returnRef", {
                                            required : "This field is required.",
                                            pattern : {
                                                value: /^[a-zA-Z0-9\s_\-']+$/,
                                                message: "Please enter a valid reference number."
                                            }
                                    })}/>
                                    
                                    {errors.returnRef && 
                                        <span className="error-msg">{errors.returnRef.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                            {/* Cost */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Cost</Form.Label>
                                    <Form.Control type="number" placeholder="Php"className={`${errors.returnCost ? "input-invalid" : ""}`} 
                                        {...register("returnCost", {
                                            required : "This field is required.",
                                            min: {
                                                value: 0,
                                                message: "PLease enter a valid cost."
                                            }
                                    })}/>
                                    
                                    {errors.returnCost && 
                                        <span className="error-msg">{errors.returnCost.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Ticket */}
                        <Row>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label className='fr-form-label input-required'>Ticket</Form.Label>
                                <Form.Control type="file" className={`${errors.returnTicket ? "input-invalid" : ""}`} 
                                    {...register("returnTicket", {
                                        required : "This field is required.",
                                        validate: {
                                            fileType: (files) =>
                                                files[0]?.type === "application/pdf" || "File must be in PDF format.",
                                            fileSize: (files) =>
                                                files[0]?.size < 5 * 1024 * 1024 || "File must be under 5MB."
                                        }
                                })}/>
                                
                                {errors.returnTicket && 
                                    <span className="error-msg">{errors.returnTicket.message}</span>
                                }
                            </Form.Group>
                        </Row>

                        {/* Notes */}
                        <Form.Group className="mt-2 mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label className='fr-form-label input-optional'>Notes</Form.Label>
                            <Form.Control {...register("notes")} value={inputNotes} onChange={(e) => setInputNotes(e.target.value)} as="textarea" placeholder='Enter notes.'/>
                        </Form.Group>
                    </fieldset>
                    <div className="d-flex flex-column">
                        {/* Error box */}
                        { (!isValid && isSubmitted) && <div className="form-box form-box-error mb-3 w-100 d-flex align-items-center px-4 gap-4">
                            <i className="bi bi-exclamation-triangle-fill fs-1"/>
                            <p className='text-start m-0'>Please check if all required fields are filled and if all inputs are valid.</p>
                        </div> }

                        <div className="d-flex justify-content-between w-100">
                            <button className="button-neg" onClick={() => setFormView(false)}>Cancel</button>
                            <button type="submit" className='btn-review btn-review--approve'>Submit and Approve</button>
                            {/* {
                                preview ?
                                    <button className="button-neg" onClick={() => setPreview(false)}>Back</button> :
                                    <button className="button-neg" onClick={handleCancel}>Cancel</button>
                            }
                            {
                                preview ?
                                    <button type="submit" className='btn-approve' onClick={home}>Submit and Approve</button> :
                                    <button className='button-affirm' onClick={handleNext}>Next</button>
                            } */}
                        </div>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>

    );
}