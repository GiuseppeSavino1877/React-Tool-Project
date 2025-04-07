// src/components/ModalDettagliProgetto.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalDettagliProgetto = ({ show, onClose, progetto, assegnazioni }) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            size="lg"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    Dettagli progetto: {progetto?.titolo}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {assegnazioni.length === 0 ? (
                    <p className="text-muted">Nessun dipendente assegnato</p>
                ) : (
                    <ul className="list-group">
                        {assegnazioni.map((a, i) => (
                            <li key={i} className="list-group-item">
                                <div>
                                    <strong>{a.ruolo}</strong> – {a.nome} {a.cognome}
                                </div>
                                <div className="progress mt-2">
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${a.percentuale}%` }}
                                        aria-valuenow={a.percentuale}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {a.percentuale}%
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onClose}>
                    Chiudi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalDettagliProgetto;