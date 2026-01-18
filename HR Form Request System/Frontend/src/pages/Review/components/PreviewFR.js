import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Form, FormGroup } from 'react-bootstrap';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

//data
import { departments, reasons } from "../../Home/components/filterData";
import { dummyRequest } from '../dummyData.js';

export default function PreviewFR() {

    const requestData = dummyRequest[0].data;

    const { register } = useForm({
        defaultValues: requestData
    })

    const [othersChecked, setOthersChecked] = useState(requestData.purpose_others ? true : false);

    return (
        <div  className='form-disable'>
            {/* Form Header */}
            <div>
                <div className='form-h1 d-flex justify-content-between align-items-end pb-3'>
                    <h1 className='tf-header d-flex justify-content-start' style={{ color: 'black' }}>TFI Request for Flight</h1>
                    {/* <div className='d-flex gap-2 fw-bold'> */}
                    <div className='form-group'>
                        <p className='form-label fr-form-label' style={{ color: "#EE9337" }}>Request ID</p>
                        <Form.Control value={dummyRequest[0].id} disabled/>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className='text-start'>
                <Form>
                    <fieldset disabled>
                        {/* Requestor Details */}
                        <div>
                            <Row className='mb-2'>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>Requestor Employee Name</Form.Label>
                                        <Form.Control {...register("requestor")} type="text" />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label className='fr-form-label'>Company Email</Form.Label>
                                        <Form.Control {...register("email")} type="email" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mb-2'>
                                <Form.Group>
                                    <Form.Label className='fr-form-label'>Department</Form.Label>
                                    <Form.Select {...register("department")}>
                                        {/* TODO: Select one, remove map */}
                                        {
                                            departments.map(item =>
                                                <option value={item.name}>{item.name}</option>
                                            )
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                        </div>

                        {/* Flight Request Details */}
                        <div>
                            <div className='form-h2'>
                                <h3 className='tf-header mt-5'>Flight Request Details</h3>
                            </div>
                            <Row className='mb-2'>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>First Name</Form.Label>
                                        <Form.Control {...register("first_name1")} type="text" />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>Middle Name</Form.Label>
                                        <Form.Control {...register("middle_name1")} type="text" />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>Last Name</Form.Label>
                                        <Form.Control {...register("last_name1")} type="text" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='mb-4'>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>Birthday</Form.Label>
                                        <Form.Control {...register("birthday1")} type="date"/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>Extensions</Form.Label>
                                        <Form.Control {...register("extensions1")} type="text" />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label className='fr-form-label'>Title</Form.Label>
                                        <Form.Select {...register("title1")}>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            {/* Add Additional Flier Button */}
                            {/* <Row>
                                <Col className='d-flex justify-content-end align-items-center'>
                                    <span style={{color:'var(--tforange-color)', marginRight: '24px', fontSize: '24px'}}>Add additional person</span>
                                    <button className="add-btn" type='button'>+</button>
                                </Col>
                            </Row> */}
                        </div>
                        <div>
                            {/* Purpose of Flight */}
                            <div>
                                <h3 className='tf-header mt-5'>Purpose of Travel</h3>
                            </div>
                            <Row>
                                <Form.Group className="mb-3 text-start fr-form-label">
                                    <Row>
                                    <Col>
                                        <div key={`default-checkbox`} className="mb-3">
                                            {
                                                reasons.slice(0, 6).map(item =>
                                                    <Form.Check {...register("purpose")}
                                                        label={item.name}
                                                        value={item.name}
                                                        type="checkbox"
                                                    />
                                                )
                                            }
                                        </div>
                                    </Col>
                                    <Col>
                                        <div key={`default-checkbox`} className="mb-3">
                                            {
                                                reasons.slice(6, 12).map(item =>
                                                    <Form.Check {...register("purpose")}
                                                        label={item.name}
                                                        value={item.name}
                                                        type="checkbox"
                                                    />
                                                )
                                            }
                                        </div>
                                    </Col>
                                    </Row>
                                    {/* Others Checkbox and Input */}
                                    <Row>
                                        <Col>
                                            <div className="d-flex align-items-center">
                                                <Form.Check
                                                    inline
                                                    type="checkbox"
                                                    checked={othersChecked}
                                                    className="me-2"
                                                />
                                                <Form.Control {...register("purpose_others")}
                                                    type="text"
                                                    style={{ maxWidth: 300 }}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Row>
                        </div>
                        <div>
                            {/* Dates of Business */}
                            <div>
                                <h3 className='tf-header mt-5 mb-0'>Exact Dates of Official Business</h3>
                                <p className='sub-text'>Input the Exact START and END dates of Official Business</p>
                            </div>
                            <div className='w-50'>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Row>
                                                <Col>
                                                    <Form.Label className='fr-form-label text-start'>Start Date</Form.Label>
                                                    <Form.Control {...register("start_business")} type="date"/>
                                                </Col>
                                                <Col xs='auto' className='d-flex align-items-center' >
                                                    To
                                                </Col>
                                                <Col>
                                                    <Form.Label className='fr-form-label text-start'>End Date</Form.Label>
                                                    <Form.Control {...register("end_business")} type="date"/>
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <div>
                            {/* Departure */}
                            <div>
                                <h3 className='tf-header mt-5 mb-0'>Departure</h3>
                                <p className='sub-text'>Preffered Departure Flight Date & Time</p>
                            </div>
                            <div>
                                <FormGroup className='mb-3'>
                                    <Row>
                                        <Col sm={3}>
                                            <Form.Label className='fr-form-label text-start'>Date</Form.Label>
                                            <Form.Control {...register("departure_date")} type="date"/>
                                        </Col>
                                        <Col sm={3}>
                                            <Form.Label className='fr-form-label text-start'>Time</Form.Label>
                                            <Form.Control {...register("departure_time")} type="time"/>
                                        </Col>
                                        <Col md>
                                            <Form.Label className='fr-form-label text-start'>Destination City/Airport</Form.Label>
                                            <Form.Control {...register("departure_city")} type="text" />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </div>
                        </div>
                        <div>
                            {/* Return */}
                            <div>
                                <h3 className='tf-header mt-5 mb-0'>Return</h3>
                                <p className='sub-text'>Preffered Return Flight Date & Time</p>
                            </div>
                            <div>
                                <FormGroup className='mb-3'>
                                    <Row>
                                        <Col sm={3}>
                                            <Form.Label className='fr-form-label text-start'>Date</Form.Label>
                                            <Form.Control {...register("return_date")} type="date"/>
                                        </Col>
                                        <Col sm={3}>
                                            <Form.Label className='fr-form-label text-start'>Time</Form.Label>
                                            <Form.Control {...register("return_time")} type="time"/>
                                        </Col>
                                        <Col md>
                                            <Form.Label className='fr-form-label text-start'>Destination City/Airport</Form.Label>
                                            <Form.Control {...register("return_city")} type="text" />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </div>
                        </div>
                        <div>
                            {/* Request for Extra Baggage */}
                            <div>
                                <h3 className='tf-header mt-5 mb-2'>Request for Extra Baggage</h3>
                            </div>
                            <Row>
                                <Col md={5}>
                                    <FormGroup>
                                        <Form.Label className='fr-form-label text-start'>Request for Extra Baggage</Form.Label>
                                        <Form.Control {...register("extra_baggage")} type="text" />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>
                        <div>
                            {/* To be Approved by */}
                            <div>
                                <h3 className='tf-header mt-5 mb-2'>To be Approved by:</h3>
                            </div>
                            <Row>
                                <Col>
                                    <FormGroup className='fr-form-label'>
                                        <div key={`inline-radio`} className="mb-5">
                                            <Form.Check {...register("approved_by")}
                                                inline
                                                label="ARC"
                                                value="ARC"
                                                type="radio"
                                                id={`inline-radio-1`}
                                            />
                                            <Form.Check {...register("approved_by")}
                                                inline
                                                label="JDLC"
                                                value="JDLC"
                                                type="radio"
                                                id={`inline-radio-2`}
                                            />
                                            <Form.Check {...register("approved_by")}
                                                inline
                                                label="ATP"
                                                value="ATP"
                                                type="radio"
                                                id={`inline-radio-3`}
                                            />
                                            <Form.Check {...register("approved_by")}
                                                inline
                                                label="DFS"
                                                value="DFS"
                                                type="radio"
                                                id={`inline-radio-3`}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>
                    </fieldset>
                </Form>
            </div>
        </div>
    )
};