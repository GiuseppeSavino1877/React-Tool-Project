import React, { useState, useEffect } from "react";
import ModalPersonale from "../components/ModalPersonale";
import ModalInfoPersonale from "../components/ModalInfoPersonale";
import axios from "axios";

const Personale = () => {
    const [personale, setPersonale] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        matricola: "",
        df: "",
        nome: "",
        cognome: "",
        ruolo: "",
        percentuale_impiego: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [progettiPersona, setProgettiPersona] = useState([]);

    useEffect(() => {
        fetchPersonale();
    }, []);

    const fetchPersonale = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/personale");
            setPersonale(res.data);
        } catch (err) {
            console.error("Errore nel caricamento del personale:", err);
        }
    };

    const handleShow = (personaleItem = null) => {
        setEditing(personaleItem);
        setFormData(
            personaleItem
                ? { ...personaleItem }
                : {
                    matricola: "",
                    df: "",
                    nome: "",
                    cognome: "",
                    ruolo: "",
                    percentuale_impiego: 0,
                }
        );
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/personale/${id}`);
            fetchPersonale();
        } catch (err) {
            console.error("Errore nella cancellazione:", err);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await axios.put(
                    `http://localhost:3001/api/personale/${editing.id}`,
                    formData
                );
            } else {
                await axios.post("http://localhost:3001/api/personale", formData);
            }
            fetchPersonale();
            handleClose();
        } catch (err) {
            console.error("Errore nel salvataggio:", err);
        }
    };

    const handleInfo = async (persona) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/assegnazioni/persona/${persona.id}`);
            setSelectedPersona(persona);
            setProgettiPersona(res.data);
            setShowInfoModal(true);
        } catch (err) {
            console.error("Errore nel caricamento dei progetti della persona:", err);
        }
    };

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = personale.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(personale.length / itemsPerPage);

    const changePage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container mt-4 content-wrapper">
            <h1 className="text-center">Gestione Personale</h1>
            <button className="btn btn-primary mb-3" onClick={() => handleShow()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                </svg><span> Aggiungi</span> 
            </button>

            <div className="table-container">
                <table className="table table-striped table-bordered table-hover text-center">
                    <thead>
                        <tr>
                            <th>Matricola</th>
                            <th>DF</th>
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Ruolo</th>
                            <th>Stato</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((p) => (
                            <tr key={p.id}>
                                <td>{p.matricola}</td>
                                <td>{p.df}</td>
                                <td>{p.nome}</td>
                                <td>{p.cognome}</td>
                                <td>{p.ruolo}</td>
                                <td>
                                    {p.stato === "disponibile" ? (
                                        <span className="rounded-circle bg-success d-inline-block" style={{ width: "15px", height: "15px" }}></span>
                                    ) : (
                                        <span className="rounded-circle bg-danger d-inline-block" style={{ width: "15px", height: "15px" }}></span>
                                    )}
                                </td>
                                <td className="d-flex justify-content-center gap-2">
                                    <button className="btn btn-warning btn-sm" onClick={() => handleShow(p)}>✏️</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                                    <button className="btn btn-info btn-sm" onClick={() => handleInfo(p)}>ℹ️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="d-flex justify-content-center mt-3">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                                <button className="page-link" onClick={() => changePage(currentPage - 1)}>Precedente</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i + 1} className={`page-item ${currentPage === i + 1 && "active"}`}>
                                    <button className="page-link" onClick={() => changePage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                                <button className="page-link" onClick={() => changePage(currentPage + 1)}>Successiva</button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <ModalPersonale
                    show={showModal}
                    editing={editing}
                    formData={formData}
                    setFormData={setFormData}
                    onClose={handleClose}
                    onSave={handleSave}
                />

                <ModalInfoPersonale
                    show={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                    persona={selectedPersona}
                    progetti={progettiPersona}
                />
            </div>
        </div>
    );
};

export default Personale;
