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
import styles from "./login.module.scss";


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
    newPassword:
        z.string({error: "TypeError: Not a string"})
            .nonempty({error: "It's empty!"}),
    confirmPassword: 
        z.string({error: "TypeError: Not a string"})
            .nonempty({error: "It's empty!"})
}).refine((data) => 
    data.newPassword === data.confirmPassword,
    { 
        error: "Oh no! Passwords don't match :(",
        path: ["confirmPassword"],
    }
);


function FormContainer() {
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
            navigate("/two-factor-auth");
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

        <Form.Group controlId="formNewPassword" className={styles['form-row']} >
            <Form.Label>
                New Password
                {errors.newPassword && (
                 <span className={styles['error-text']}> *</span>
                 )}
            </Form.Label>
            <InputGroup>
                <Form.Control type={passwordHidden ? "password" : "text"}
                    placeholder="Enter New Password"
                    className={styles["form-row__input-text"]}
                    {...register("newPassword")}/>
                <Button type="button" className={styles['form-row__input-button']}
                    onClick={handlePasswordReveal}>
                    {passwordHidden ?
                        <FontAwesomeIcon icon={faEye} /> : 
                        <FontAwesomeIcon icon={faEyeSlash} />
                    }
                </Button>
            </InputGroup>
            <Form.Text style={{ visibility: errors.newPassword ? 'visible' : 'hidden' }}>
                 <FontAwesomeIcon icon={faTriangleExclamation} />
                 <span className={styles['error-text']}>&nbsp;{errors.newPassword?.message}</span>
             </Form.Text>
        </Form.Group>


        <Form.Group controlId="formConfirmPassword" className={styles['form-row']} >
            <Form.Label>
                Confirm Password
                {errors.confirmPassword && (
                 <span className={styles['error-text']}> *</span>
                 )}
            </Form.Label>
            <InputGroup>
                <Form.Control type={passwordHidden ? "password" : "text"}
                    placeholder="Confirm New Password"
                    className={styles["form-row__input-text"]}
                    {...register("confirmPassword")}/>
                <Button type="button" className={styles['form-row__input-button']}
                    onClick={handlePasswordReveal}>
                    {passwordHidden ?
                        <FontAwesomeIcon icon={faEye} /> : 
                        <FontAwesomeIcon icon={faEyeSlash} />
                    }
                </Button>
            </InputGroup>
            <Form.Text style={{ visibility: errors.confirmPassword ? 'visible' : 'hidden' }}>
                 <FontAwesomeIcon icon={faTriangleExclamation} />
                 <span className={styles['error-text']}>&nbsp;{errors.confirmPassword?.message}</span>
             </Form.Text>
        </Form.Group>

         <Form.Group controlId="formSubmission" className={styles['button-row']} >
            <Link to="/login" className={styles["button-row__button--negate"]}>Back</Link>
            <Button type="submit" className={styles["button-row__button--affirm"]} disabled={isSubmitting}>Next</Button>
         </Form.Group>
    </Form>
    );

}


export default function ResetPassword(){


    return (
        <MainContainer navVisible={false}>
        <div className="row h-100 m-0">

            <div className="h-100" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    top: '50px'}}>
                <div className={styles["login-container"]}>
                    <header className={styles["login-header"]}>
                        <h1 className={styles["login-header__h1"]}>Reset your password</h1>
                    </header>

                    <FormContainer />

                </div>
            </div>

        </div>

         </MainContainer>
    );
}
