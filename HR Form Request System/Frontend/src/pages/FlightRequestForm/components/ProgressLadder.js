// data
import { progressData } from '../flightRequesData';


export default function ProgressLadder() {
    return (
        <div className="progress-ladder mt-5">
            {progressData.map((step, idx) => (
                <div className="d-flex align-items-start" key={idx}>
                    <div className="d-flex flex-column align-items-center" style={{ minWidth: 32 }}>
                        <div className={`step-circle ${idx === progressData.length - 1 ? 'active' : ''}`}></div>
                        {idx !== progressData.length - 1 && <div className="step-line" />}
                    </div>
                    <div className="ms-3">
                        <div className="progress-ladder-text"><h1>{step.status}</h1></div>
                        <div className="progress-ladder-text"><p>{step.date}</p></div>
                    </div>
                </div>
            ))}
        </div>
    );
}