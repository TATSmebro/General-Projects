import { Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//components
import MainContainer from '../../components/MainContainer';
import BookingForm from '../../components/BookingForm';

export default function BookingDetails() {

    const [formView, setFormView] = useState(true);

    let navigate = useNavigate();
    
    const handleBack = () => {
        navigate("/flight-request-form");
    }

    return(
        <MainContainer>
            <Row>
                {/*Left Content*/}
                <Col className='tf-header h1 d-flex justify-content-center'>
                </Col>

                {/*Center Content*/}
                <Col xs={7}>
                    
                    {/* Back and Proceed Button */}
                    <div className="d-flex justify-content-between align-items-center">
                        <button type='button' className="hover-underline d-flex align-items-center" onClick={handleBack}>
                            <i className="bi bi-chevron-left" style={{ fontSize: '18px', color: '#EE9337' }}></i>
                            <span style={{ color: '#EE9337', fontSize: '14px' }}>Request Form</span>
                        </button>

                    </div>

                    <BookingForm view={formView} setFormView={setFormView} preview={true}/>
                </Col>

                {/*Right Content Additional Form Content Goes Here*/}
                <Col>
                </Col>
            </Row>
        </MainContainer>
    )
}