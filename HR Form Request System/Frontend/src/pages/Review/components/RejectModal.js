import { Modal } from "react-bootstrap";

export default function RejectModal ({ view, setView }) {

    const handleReject = () => {
        setView(false);
        window.location.href = "/";
    }

    return (
        <Modal show={view} size="md" centered>
            <Modal.Body className="mt-2 text-center">
                <h5>Reject this request?</h5>
                <p className="m-0">This action will mark the request as rejected. Your comments will be included in the notification sent to the requestor.</p>

                <div className="d-flex justify-content-between w-100">
                    <button className="button-neg" onClick={() => setView(false)}>Cancel</button>
                    <button className='btn-review btn-review--reject' onClick={handleReject}>Reject</button>
                </div>
            </Modal.Body>
        </Modal>
    )
}