import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

//components
import MainContainer from '../../components/MainContainer';
import ProgressLadder from './components/ProgressLadder';
import FlightRequestComponent from '../../components/FlightRequestComponent';


export default function FlightRequestForm() {
    let navigate = useNavigate();

    const navigateHome = () => {
        navigate("/");
    }

    const navigateBooking = () => {
        // navigate("/request/:id/booking-details");
        // TODO Add navigate to associated booking details **page**
    }

    return(
        <MainContainer>
            <Row>
                {/*Left Content*/}
                <Col className='tf-header h1 d-flex justify-content-center'>
                    <ProgressLadder/>
                </Col>

                {/*Center Content*/}
                <Col xs={7} className="text-center">
                    
                    
                    <div className="d-flex justify-content-between align-items-center">

                        {/* Back Button */}
                        <button type='button' className="hover-underline d-flex align-items-center"
                            onClick={navigateHome}>
                            <i className="bi bi-chevron-left" style={{ fontSize: '18px', color: '#EE9337' }}></i>
                            <span style={{ color: '#EE9337', fontSize: '14px' }}>Back</span>
                        </button>

                        {/* Proceed Button */}
                        <button type='button' className="hover-underline d-flex align-items-center"
                            onClick={navigateBooking}>
                            <span style={{ color: '#EE9337', fontSize: '14px' }}>Booking Details</span>
                            <i className="bi bi-chevron-right" style={{ fontSize: '18px', color: '#EE9337' }}></i>
                            {/* TODO Add disappear if no booking details.
                                Possibly add non-editable version of form.
                                Possibly improve UI consistency? */}
                        </button>
                        
                    </div>

                    {/* Flight Request Form */}
                    <FlightRequestComponent />
                </Col>

                {/*Right Content Additional Form Content Goes Here*/}
                <Col>
                </Col>
            </Row>
        </MainContainer>
    )
}
