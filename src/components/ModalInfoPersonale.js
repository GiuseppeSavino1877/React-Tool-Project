import React from "react";
import { Modal } from "react-bootstrap";

const ModalInfoPersonale = ({ show, onClose, persona, progetti }) => {
    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Assegnazioni di {persona?.nome} {persona?.cognome}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {progetti.length === 0 ? (
                    <p className="text-muted">Nessun progetto assegnato</p>
                ) : (
                    <ul className="list-group">
                        {progetti.map((proj, index) => (
                            <li key={index} className="list-group-item">
                                <div className="fw-bold mb-1">{proj.progetto}</div>
                                <div className="progress">
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${proj.percentuale}%` }}
                                        aria-valuenow={proj.percentuale}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {proj.percentuale}%
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal.Body>

        </Modal>
    );
};

export default ModalInfoPersonale;
