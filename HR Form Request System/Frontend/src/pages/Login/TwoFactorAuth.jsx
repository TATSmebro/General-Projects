import MainContainer from '../../components/MainContainer';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./login.module.scss";

import OtpInput from '../../components/OtpInput';


// TODO Add Timed Resend Button Function



export default function TwoFactorAuth(){
    let navigate = useNavigate();
    const dummyData = {
        phoneNumber: "+63 967 702 9444",
        timeTillOTP: 6
    };

    const handleSubmit = () => {
        navigate("/");

    }

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
                        <h1 className={styles["login-header__h1"]}>Enter Your OTP Code</h1>
                        <p>Enter the OTP we sent to <strong>{dummyData.phoneNumber}</strong></p>
                    </header>

                    <form action='' method='get' className={styles["login-form"]}>

                        <OtpInput dummyData={dummyData}/>

                        <div className={styles["button-row"]}>
                            <Link to="/reset-password" className={styles["button-row__button--negate"]}>Back</Link>
                            <button type="submit" className={styles["button-row__button--affirm"]}
                            onClick={handleSubmit}>Reset</button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
     

         </MainContainer>
    );
}
