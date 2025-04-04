import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";

const Home = () => {
    const [progetti, setProgetti] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [progettoCorrente, setProgettoCorrente] = useState(null);
    const [assegnazioni, setAssegnazioni] = useState([]);

    useEffect(() => {
        fetchProgetti();
    }, []);

    const fetchProgetti = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/progetti");
            setProgetti(res.data);
        } catch (err) {
            console.error("Errore nel caricamento progetti:", err);
        }
    };

    const openModal = async (progetto) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/assegnazioni/dettagli/${progetto.id}`);
            setAssegnazioni(res.data);
            setProgettoCorrente(progetto);
            setShowModal(true);
        } catch (err) {
            console.error("Errore nel caricamento assegnazioni:", err);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Progetti Attivi</h1>
            <div className="row">
                {progetti.map((proj) => (
                    <div className="col-md-4 mb-4" key={proj.id}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title fw-bold">{proj.titolo}</h5>
                                <p className="card-text">
                                    <strong>Inizio:</strong> {new Date(proj.data_inizio).toLocaleDateString("it-IT")}<br />
                                    <strong>Rilascio:</strong> {new Date(proj.data_rilascio).toLocaleDateString("it-IT")}
                                </p>
                                <button className="btn btn-info" onClick={() => openModal(proj)}>ℹ️</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Dettagli progetto: {progettoCorrente?.titolo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {assegnazioni.length === 0 ? (
                        <p className="text-muted">Nessun personale assegnato</p>
                    ) : (
                        <ul className="list-group">
                            {assegnazioni.map((a, i) => (
                                <li key={i} className="list-group-item">
                                    <div><strong>{a.ruolo}</strong> – {a.nome} {a.cognome}</div>
                                    <div className="progress mt-2">
                                        <div className="progress-bar" role="progressbar" style={{ width: `${a.percentuale}%` }}>
                                            {a.percentuale}%
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Home;
