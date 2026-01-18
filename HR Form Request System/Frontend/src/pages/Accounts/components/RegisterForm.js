import { useState, useEffect } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";

// API
import { useDepartments } from "../../../queryFunctions/StaticDataQueries";
import UserCredentialsAPI from "../../../api/UserCredentialsAPI";

export default function RegisterForm({view, setFormView, setRefresh, setIsLoading}) {

    // Initialize form
    const { register, handleSubmit, reset, formState: { errors, isValid, isSubmitted, isSubmitSuccessful } } = useForm({
        defaultValues: {
            username: "",
            password: "",
            email: "",
            phone: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            department_id: "",
            role_id: "",
            profile_photo: "",
        }
    })

    const { data: departments, isPending: departmentsLoading, isError: departmentsError } = useDepartments();

    // Submit form
    const displayValues = (values) => {
        setIsLoading(true)
        console.log(values);
        submitUserData(values);
        setFormView(false);
    }

    // Add user to database
    const submitUserData = async(values) => {
        const response = await new UserCredentialsAPI().addUserCredentials(values)
        if (response?.ok) {
            setRefresh(true)
            console.log("User added!")
        } else console.log(response.statusMessage)
    }

    // Reset changes and close modal
    const handleCancel = () => {
        setFormView(false);
        reset();
    }

    // Reset form upon successful form submission
    useEffect(() => {
        reset();
    }, [isSubmitSuccessful])

    return ( 

        <Modal show={view} size="lg" className="form-modal" centered>
            <Modal.Body className="my-4">
                <div className="tf-form-title mt-2 mb-4">
                    <h1 className="tf-header text-black">Register User</h1>
                </div>
                <div>
                    <Form onSubmit={handleSubmit(displayValues)}>
                        <div className="tf-form-section">
                            <h2>User</h2>
                            <p>User Information</p>
                        </div>

                        <Row>
                            {/*First Name */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>First Name</Form.Label>
                                    <Form.Control className={`${errors.first_name ? "input-invalid" : ""}`} type="text" placeholder="First Name" 
                                        {...register("first_name", {
                                            required : "This field is required.",
                                            maxLength: {
                                                value: 50,
                                                message: "Max characters reached."
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z\s\-']+$/,
                                                message: "Only letters, space, and hyphen characters are allowed."
                                            }
                                    })}/>
                                    
                                    {errors.first_name && 
                                        <span className="error-msg">{errors.first_name.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                            
                            {/* Middle Name */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-optional'>Middle Name</Form.Label>
                                    <Form.Control className={`${errors.middle_name ? "input-invalid" : ""}`} type="text" placeholder="Middle Name" 
                                        {...register("middle_name", {
                                            maxLength: {
                                                value: 50,
                                                message: "Max characters reached."
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z\s\-']+$/,
                                                message: "Only letters, space, and hyphen characters are allowed."
                                            }
                                    })}/>
                                    
                                    {errors.middle_name && 
                                        <span className="error-msg">{errors.middle_name.message}</span>
                                    }
                                </Form.Group>                            
                            </Col>
                            
                            {/* Last Name */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Last Name</Form.Label>
                                    <Form.Control className={`${errors.last_name ? "input-invalid" : ""}`} type="text" placeholder="Last Name" 
                                        {...register("last_name", {
                                            required : "This field is required.",
                                            maxLength: {
                                                value: 50,
                                                message: "Max characters reached."
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z\s\-']+$/,
                                                message: "Only letters, space, and hyphen characters are allowed."
                                            }
                                    })}/>
                                    
                                    {errors.last_name && 
                                        <span className="error-msg">{errors.last_name.message}</span>
                                    }
                                </Form.Group>                            
                            </Col>
                        </Row>

                        <Row>
                            {/* Email */}
                            <Col>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label className='fr-form-label input-required'>Email address</Form.Label>
                                    <Form.Control className={`${errors.email ? "input-invalid" : ""}`} type="text" placeholder="name@email.com" 
                                        {...register("email", {
                                            required : "This field is required.",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "PLease enter a valid email."
                                            }
                                    })}/>
                                    
                                    {errors.email && 
                                        <span className="error-msg">{errors.email.message}</span>
                                    }
                                </Form.Group>
                            </Col>

                            {/* Phone Number */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Phone Number</Form.Label>
                                    <Form.Control className={`${errors.phone ? "input-invalid" : ""}`} type="text" placeholder="09XXXXXXXX"                                     
                                        {...register("phone", {
                                            required : "This field is required.",
                                            pattern: {
                                                value: /^09\d{9}$/,
                                                message: "PLease enter a valid phone number."
                                            }
                                    })}/>
                                    
                                    {errors.phone && 
                                        <span className="error-msg">{errors.phone.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            {/* Department */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Department</Form.Label>
                                    <Form.Select {...register("department_id", {required : "This field is required.", valueAsNumber: true})}
                                        className={`${errors.department_id ? "input-invalid" : ""}`}>
                                        <option disabled value=''>Select Department</option>
                                        {
                                            departments?.map((item, idx) => 
                                                <option key={idx} value={item.id}>{item.department_name}</option>)
                                        }
                                    </Form.Select>
                                    
                                    {errors.department_id && 
                                        <span className="error-msg">{errors.department_id.message}</span>
                                    }
                                </Form.Group>
                            </Col>

                            {/* Role */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Role</Form.Label>
                                    <Form.Select {...register("role_id", {required : "This field is required."})}
                                        className={`${errors.role_id ? "input-invalid" : ""}`} >
                                        <option disabled value="">Select Role</option>
                                        <option value="1">HR</option>
                                        <option value="2">Employee</option>
                                    </Form.Select>

                                    {errors.role_id && 
                                        <span className="error-msg">{errors.role_id.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="tf-form-section">
                            <h2>Account Credentials</h2>
                            <p>Username and Password</p>
                        </div>
                        
                        <Row>
                            {/* Username */}
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fr-form-label input-required'>Username</Form.Label>
                                    <Form.Control className={`${errors.username ? "input-invalid" : ""}`} type="text" placeholder="Enter username" 
                                        {...register("username", {
                                            required : "This field is required.",
                                            maxLength: {
                                                value: 20,
                                                message: "Max characters reached."
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9_.]+$/,
                                                message: "Only letters, numbers, periods, and underscores are allowed."
                                            }
                                    })}/>
                                    
                                    {errors.username && 
                                        <span className="error-msg">{errors.username.message}</span>
                                    }
                                </Form.Group>
                            </Col>

                            {/* Password */}
                            <Col>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label className='fr-form-label input-required'>Password</Form.Label>
                                    <Form.Control className={`${errors.password ? "input-invalid" : ""}`} type="password" placeholder="Enter password" 
                                        {...register("password", {
                                            required : "This field is required.",
                                            minLength: {
                                                value: 8,
                                                message: "Password must be at least 8 characters long."
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9_\-]+$/,
                                                message: "Only letters, numbers, underscores, and hyphens are allowed."
                                            }
                                    })}/>
                                    
                                    {errors.password && 
                                        <span className="error-msg">{errors.password.message}</span>
                                    }
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex flex-column">
                            { (!isValid && isSubmitted) && <div className="form-box form-box-error mb-3 w-100 d-flex align-items-center px-4 gap-4">
                                <i className="bi bi-exclamation-triangle-fill fs-1"/>
                                <p className='text-start m-0'>Please check if all required fields are filled and if all inputs are valid.</p>
                            </div> }
                            <div className="d-flex justify-content-between w-100">
                                <button type="button" className="btn-pill btn-pill--cancel" onClick={handleCancel}>Cancel</button>
                                <button type="submit" className='btn-pill btn-pill--orange'>Submit</button>
                            </div>
                        </div>
                    </Form>
                </div>
            </Modal.Body>
        </Modal>

    );
}