import React, { useState, useEffect } from "react";
import axios from "axios";

const Progetti = () => {
    const [progetti, setProgetti] = useState([]);
    const [formData, setFormData] = useState({
        titolo: "",
        data_inizio: "",
        durata_presunta: 0,
        data_rilascio: "",
    });
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchProgetti();
    }, []);

    const fetchProgetti = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/progetti");
            setProgetti(res.data);
        } catch (err) {
            console.error("Errore nel caricamento dei progetti:", err);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await axios.put(`http://localhost:3001/api/progetti/${editing.id}`, formData);
            } else {
                await axios.post("http://localhost:3001/api/progetti", formData);
            }
            setShowForm(false);
            setEditing(null);
            fetchProgetti();
        } catch (err) {
            console.error("Errore nel salvataggio:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/progetti/${id}`);
            fetchProgetti();
        } catch (err) {
            console.error("Errore nella cancellazione:", err);
        }
    };

    const handleEdit = (progetto) => {
        setEditing(progetto);
        setFormData(progetto);
        setShowForm(true);
    };

    const handleNew = () => {
        setEditing(null);
        setFormData({
            titolo: "",
            data_inizio: "",
            durata_presunta: 0,
            data_rilascio: "",
        });
        setShowForm(true);
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return date.toLocaleDateString("it-IT"); // formato dd/mm/yyyy
    };

    const isValid =
        formData.titolo.trim() !== "" &&
        formData.data_inizio !== "" &&
        formData.durata_presunta > 0 &&
        formData.data_rilascio !== "";


    const currentItems = progetti.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(progetti.length / itemsPerPage);

    return (
        <div className="container mt-4 content-wrapper">
            <h1 className="text-center">Gestione Progetti</h1>

            <button className="btn btn-primary mb-3" onClick={handleNew}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                </svg> <span> Nuovo Progetto</span>
            </button>

            {showForm && (
                <div className="card p-3 mb-4">
                    <h5>{editing ? "Modifica Progetto" : "Nuovo Progetto"}</h5>
                    <div className="row">
                        <div className="mb-3 col-6">
                            <label className="form-label">Titolo</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.titolo}
                                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                            />
                        </div>
                        <div className="mb-3 col-3">
                            <label className="form-label">Data Inizio</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.data_inizio}
                                onChange={(e) => setFormData({ ...formData, data_inizio: e.target.value })}
                            />
                        </div>
                        <div className="mb-3 col-3">
                            <label className="form-label">Durata Presunta (giorni)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.durata_presunta}
                                onChange={(e) =>
                                    setFormData({ ...formData, durata_presunta: parseInt(e.target.value) || 0 })
                                }
                            />
                        </div>
                        <div className="mb-3 col-3">
                            <label className="form-label">Data Rilascio</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.data_rilascio}
                                onChange={(e) => setFormData({ ...formData, data_rilascio: e.target.value })}
                            />
                        </div>
                        <div className="col-12 d-flex gap-2">
                            <button
                                className="btn btn-success"
                                onClick={handleSave}
                                disabled={!isValid}
                                title={!isValid ? "Compila tutti i campi" : ""}
                            >
                                Salva
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <table className="table table-striped table-bordered text-center">
                <thead>
                    <tr>
                        <th>Titolo</th>
                        <th>Data Inizio</th>
                        <th>Durata</th>
                        <th>Data Rilascio</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((proj) => (
                        <tr key={proj.id}>
                            <td>{proj.titolo}</td>
                            <td>{formatDate(proj.data_inizio)}</td>
                            <td>{proj.durata_presunta} gg</td>
                            <td>{formatDate(proj.data_rilascio)}</td>
                            <td>
                                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(proj)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                    </svg>
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj.id)}>
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

            {/* Paginazione */}
            <div className="d-flex justify-content-center mt-3">
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                &laquo;
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li
                                key={i + 1}
                                className={`page-item ${currentPage === i + 1 && "active"}`}
                            >
                                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                &raquo;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Progetti;
