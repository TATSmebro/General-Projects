import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


import styles from "./otpInput.module.scss";


export default function OtpInput ({ dummyData }) {

    return (
        <Form.Group className={styles['form-row']} controlId="otpInput">
            <div className={styles["otp-input"]}>
                <input className={styles["otp-input__number"]} 
                    name='otp1' type='text' placeholder="0"
                    maxlength="1" size="1"/>
                <input className={styles["otp-input__number"]} 
                    name='otp2' type='text' placeholder="0"
                    maxlength="1" size="1"/>
                <input className={styles["otp-input__number"]} 
                    name='otp3' type='text' placeholder="0"
                    maxlength="1" size="1"/>
                <input className={styles["otp-input__number"]}
                    name='otp4' type='text' placeholder="0"
                    maxlength="1" size="1"/>
                <input className={styles["otp-input__number"]} 
                    name='otp5' type='text' placeholder="0"
                    maxlength="1" size="1"/>
                <input className={styles["otp-input__number"]} 
                    name='otp6' type='text' placeholder="0"
                    maxlength="1" size="1"/>
            </div>
            {/* FIXME the input boxes should go to next*/}

            <Form.Text className={styles["form-legend"]}>
                Resend available in <strong>{dummyData.timeTillOTP}
                </strong> seconds. {/* TODO Format Time */}
                <button type="button" className="link">Resend OTP</button>
            </Form.Text>

        </Form.Group>
    );
}
