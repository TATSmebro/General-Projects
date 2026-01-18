import { Modal } from "react-bootstrap";
import BookingForm from "../../../components/BookingForm";

export default function BookingModal({view, setFormView, notes, preview}) {

    return (
        <Modal show={view} size="lg" className="form-modal">
            <Modal.Body className="my-4">
                <BookingForm view={view} setFormView={setFormView} notes={notes} preview={preview} />
            </Modal.Body>
        </Modal>
    )
}