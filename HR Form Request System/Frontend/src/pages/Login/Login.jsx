import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

import MainContainer from '../../components/MainContainer';
import loginImage from "../../assets/LoginImage.jpeg"
import styles from "./login.module.scss";

// TODO: Eager Validation as outlined here: https://www.reddit.com/r/webdev/comments/nr9rso/how_to_validate_forms_properly_some_useful_dos/

const schemaValidator = z.object({
    username: 
        z.union([ // First Checks if Username. If @ is included, starts checking full email regex
                z.string({error: "TypeError: Not a string"})
                    .refine((username) => 
                        !z.string().includes("@").safeParse(username).success, 
                        { error: "Oops this is not a valid email address"}) // If Error, UX assumes user is trying to input an email
                    .nonempty({ error: "It's empty! "}),
                z.email({ error: "Oops this is not a valid email address"}) // Checks full email regex
                    .nonempty({ error: "It's empty! "})
        ])
    ,
    password: 
        z.string({error: "TypeError: Not a string"})
            .nonempty({error: "It's empty!"}),
});


function FormContainer(){
    let [passwordHidden, setPasswordHidden] = useState(true);
    let navigate = useNavigate();
    const { register,
        handleSubmit,
        formState: { errors, isSubmitting },
     } = useForm({
        resolver: zodResolver(schemaValidator),
     });

        
    const onSubmit = (data) => {
        try {
            console.log(errors);
    
            navigate("/");
        }
        catch (error) {
            console.log(errors);
        }
    }

    const handlePasswordReveal = () => {
        setPasswordHidden(!passwordHidden); 
    }

    return (
    <Form className={styles['login-form']} onSubmit={handleSubmit(onSubmit)}>
        
        <Form.Group className={styles['form-row']} controlId="formUsername">
            <Form.Label>
                Username / TechFactors Email
                {errors.username && (
                     <span className={styles['error-text']}> *</span>
                 )}
            </Form.Label>
            <Form.Control type="text" 
                placeholder="Enter Username or TechFactors Email"
                className={styles["form-row__input-text"]}
                {...register("username")}/>
            {/* FIX Form Control Sizing using: https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing#browser_compatibility */}
            <Form.Text style={{ visibility: errors.username ? 'visible' : 'hidden' }}>
                 <FontAwesomeIcon icon={faTriangleExclamation} />
                 <span className={styles['error-text']}>&nbsp;{errors.username?.message}</span>
            </Form.Text>
        </Form.Group>

        <Form.Group controlId="formPassword" className={styles['form-row']} >
            <Form.Label>
                Password
                {errors.password && (
                 <span className={styles['error-text']}> *</span>
                 )}
            </Form.Label>
            <InputGroup>
                <Form.Control type={passwordHidden ? "password" : "text"}
                    placeholder="Enter Password"
                    className={styles["form-row__input-text"]}
                    {...register("password")}/>
                <Button type="button" className={styles['form-row__input-button']}
                    onClick={handlePasswordReveal}>
                    {passwordHidden ?
                        <FontAwesomeIcon icon={faEye} /> : 
                        <FontAwesomeIcon icon={faEyeSlash} />
                    }
                </Button>
            </InputGroup>
            <Form.Text style={{ visibility: errors.password ? 'visible' : 'hidden' }}>
                 <FontAwesomeIcon icon={faTriangleExclamation} />
                 <span className={styles['error-text']}>&nbsp;{errors.password?.message}</span>
             </Form.Text>        

            <Link to="/reset-password" className={styles["login-form__link"]}>
                Forgot your password?</Link>
        </Form.Group>

        
        <Form.Group controlId="formSubmission" className={styles['button-row']} >
            <Button type="submit" className={styles["button-row__button--affirm"]}
                disabled={isSubmitting}>Log In</Button> {/* TODO Modify Bootstrap default styling */}
        </Form.Group>
    </Form>
    );
}


export default function Login(){
    return (
    <MainContainer navVisible={false}>
        <div className="row h-100 m-0">
            <div className="col-md-3 col-lg-2"
                style={{ width: '50%',
                        borderRight: '5px solid var(--tforange-color)' }}>
                <h1 style={{textAlign: 'center', fontWeight: 'bold'}}>Made By</h1>
                <figure className={styles['login-figure']}>
                    <img src={loginImage} className={styles['login-figure__image']}
                    alt="TechFactor Interns"/>
                </figure>
            </div>

            <div className="h-100" style={{
                    width: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    top: '50px'}}>
                <div className={styles["login-container"]}>
                    <header className={styles["login-header"]}>
                        <h1 className={styles["login-header__h1"]}>
                            Welcome Back to
                            <strong className={styles["login-header__strong"]}> TechForms*</strong></h1>
                        <p>
                            Manage all your TechFactors forms right here!</p>
                    </header>

                    <FormContainer />
                </div>
            </div>
        </div>
    </MainContainer>
    );
}

