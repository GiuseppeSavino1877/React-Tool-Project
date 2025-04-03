import React, { useState, useEffect } from "react";
import ModalPersonale from "../components/ModalPersonale";
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

    // Paginazione
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
                                        <span
                                            className="rounded-circle bg-success d-inline-block"
                                            style={{ width: "15px", height: "15px" }}
                                        ></span>
                                    ) : (
                                        <span
                                            className="rounded-circle bg-danger d-inline-block"
                                            style={{ width: "15px", height: "15px" }}
                                        ></span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleShow(p)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Navigazione Pagine */}
                <div className="d-flex justify-content-center mt-3">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                                <button
                                    className="page-link"
                                    onClick={() => changePage(currentPage - 1)}
                                >
                                    &laquo;
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li
                                    key={i + 1}
                                    className={`page-item ${currentPage === i + 1 && "active"}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => changePage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li
                                className={`page-item ${currentPage === totalPages && "disabled"
                                    }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => changePage(currentPage + 1)}
                                >
                                    &raquo;
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Modal per aggiunta/modifica */}
                <ModalPersonale
                    show={showModal}
                    editing={editing}
                    formData={formData}
                    setFormData={setFormData}
                    onClose={handleClose}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
};

export default Personale;
