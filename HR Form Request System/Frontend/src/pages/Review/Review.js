// export default Home;
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

// components
import MainContainer from '../../components/MainContainer';
import BookingForm from './components/BookingForm';
import RejectModal from './components/RejectModal';
import PreviewFR from './components/PreviewFR';
import BookingModal from './components/BookingModal';

export default function Review() {

    // Form for notes
    const [notes, setNotes] = useState("");
    const { register, handleSubmit, formState } = useForm({
        defaultValues: {
            notes: "",
        }
    })

    // Open the booking form
    const [reject, setReject] = useState();
    const [formView, setFormView] = useState(false);

    const displayNotes = (values) => {
        setNotes(values.notes);
        if (!reject) setFormView(true);
    }

    
    // Go back to home after reject
    const home = async () => {
        window.location.href = "/";
    }

    return (
        <MainContainer>
        <div className="row h-100 m-0">
            {/* Left Side */}
            <div className="col-md-3 col-lg-2 h-100 overflow-auto"  style={{ width: '30%', borderRight: '5px solid var(--tforange-color)' }}>

                {/* Header - Requests + Searchbar + Filter */}
                <div className="d-flex justify-content-between align-items-center pb-2">
                    <button type='button' className="hover-underline d-flex align-items-center" onClick={home}>
                        <i className="bi bi-chevron-left" style={{ fontSize: '18px', color: '#EE9337' }}></i>
                        <span style={{ color: '#EE9337', fontSize: '14px' }}>Back</span>
                    </button>
                </div>

                <Form onSubmit={handleSubmit(displayNotes)}>
                    <Form.Group className="mt-2 mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label className='review-notes'>Notes:</Form.Label>
                        <Form.Control {...register("notes")} as="textarea" placeholder='Enter notes.' rows={3} style={{height: '60vh', borderColor: '#575757'}}/>
                    </Form.Group>

                    {/* Add pop-up for reject */}
                    <div className='d-flex justify-content-center gap-2 btn-group-review'>
                        <button type='submit' onClick={() => setReject(true)} className='btn-reject py-1'>Reject</button>
                        <button type='submit' onClick={() => setReject(false)} className='btn-add py-1'>Approve</button>
                    </div>
                </Form>
                <RejectModal view={reject} setView={setReject} />
                {/* <BookingForm view={formView} setFormView={setFormView} notes={notes} /> */}
                <BookingModal view={formView} setFormView={setFormView} notes={notes} preview={false} /> 
            </div>

            {/* Right Content */}
            <div className="p-4 h-100 overflow-auto border" style={{width: '70%',display: 'flex',flexDirection: 'column',}}>
                <PreviewFR />  
            </div>

        </div>
        </MainContainer>
    );
};
