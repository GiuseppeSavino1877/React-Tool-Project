import React, { useState, useEffect } from "react";
import axios from "axios";

const Progetti = () => {
    const [formData, setFormData] = useState({
        titolo: "",
        data_inizio: "",
        durata_presunta: 0,
        data_rilascio: "",
        budget: "",
    });
    const [editing, setEditing] = useState(null);
    const [progetti, setProgetti] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [personaleDisponibile, setPersonaleDisponibile] = useState([]);
    const [ruoloSelezionato, setRuoloSelezionato] = useState("");
    const [personaSelezionata, setPersonaSelezionata] = useState("");
    const [assegnazioni, setAssegnazioni] = useState([]);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("success");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("titolo");
    const [sortDirection, setSortDirection] = useState("asc");
    const itemsPerPage = 12;

    const showToast = (message, type = "success, danger") => {
        setToastMsg(message);
        setToastType(type);
        setTimeout(() => setToastMsg(""), 3000);
    };

    useEffect(() => {
        fetchProgetti();
        fetchPersonaleDisponibile();
    }, []);

    useEffect(() => {
        const fetchAndCalculateBusinessDays = async () => {
            if (!formData.data_inizio || !formData.data_rilascio) return;

            const inizio = new Date(formData.data_inizio);
            const rilascio = new Date(formData.data_rilascio);

            if (rilascio <= inizio) {
                setFormData(prev => ({ ...prev, durata_presunta: 0 }));
                showToast("La data di rilascio deve essere successiva alla data di inizio", "info");
                return;
            }

            try {
                const yearStart = inizio.getFullYear();
                const yearEnd = rilascio.getFullYear();
                const years = Array.from(new Set([yearStart, yearEnd]));

                // Chiedi le festività per ogni anno coinvolto
                const holidayResponses = await Promise.all(
                    years.map(year =>
                        axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/IT`)
                    )
                );

                const holidayDates = new Set();
                holidayResponses.forEach(res => {
                    res.data.forEach(day => {
                        holidayDates.add(day.date);
                    });
                });

                let workingDays = 0;
                let current = new Date(inizio);

                while (current <= rilascio) {
                    const day = current.getDay(); // 0 = Domenica, 6 = Sabato
                    const dateStr = current.toISOString().split("T")[0];

                    if (day !== 0 && day !== 6 && !holidayDates.has(dateStr)) {
                        workingDays++;
                    }

                    current.setDate(current.getDate() + 1);
                }

                setFormData(prev => ({ ...prev, durata_presunta: workingDays }));

            } catch (error) {
                console.error("Errore nel recupero delle festività:", error);
                showToast("Errore nel calcolo dei giorni lavorativi", "danger");
            }
        };

        fetchAndCalculateBusinessDays();
    }, [formData.data_inizio, formData.data_rilascio]);


    const fetchProgetti = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/progetti");
            setProgetti(res.data);
        } catch (err) {
            console.error("Errore nel caricamento dei progetti:", err);
        }
    };

    const fetchPersonaleDisponibile = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/personale");
            setPersonaleDisponibile(res.data);
        } catch (err) {
            console.error("Errore nel caricamento del personale:", err);
        }
    };

    const fixDateForPostgres = (localDate) => {
        if (!localDate) return "";
        const date = new Date(localDate);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - timezoneOffset).toISOString().split("T")[0];
    };

    const resetForm = () => {
        setFormData({
            titolo: "",
            data_inizio: "",
            durata_presunta: 0,
            data_rilascio: "",
        });
        setEditing(null);
        setAssegnazioni([]);
        setPersonaSelezionata("");
        setRuoloSelezionato("");
        setShowForm(false);
    };

    const handleEdit = async (progetto) => {
        setEditing(progetto);
        const fixDateForInput = (dateString) => {
            const date = new Date(dateString);
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - timezoneOffset).toISOString().split("T")[0];
        };

        await fetchPersonaleDisponibile();

        setFormData({
            ...progetto,
            data_inizio: fixDateForInput(progetto.data_inizio),
            data_rilascio: fixDateForInput(progetto.data_rilascio),
            budget: progetto.budget !== null
                ? Number(progetto.budget).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : ""
        });

        try {
            const res = await axios.get(`http://localhost:3001/api/assegnazioni/${progetto.id}`);

            const assegnazioniConGiorni = res.data.map(a => {
                const percentuale = parseFloat(a.percentuale) || 0;
                const giorniPrevisti = Math.round((progetto.durata_presunta * percentuale) / 100);
                return {
                    ...a,
                    giorni_previsti: giorniPrevisti
                };
            });

            setAssegnazioni(assegnazioniConGiorni);
        } catch (err) {
            console.error("Errore nel caricamento assegnazioni:", err);
        }
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/progetti/${id}`);
            fetchProgetti();
            showToast("Progetto eliminato", "success");
        } catch (err) {
            console.error("Errore nella cancellazione:", err);
            showToast("Errore nella cancellazione", "danger");
        }
    };

    const handleAddPerson = () => {
        if (!personaSelezionata) return;
        const persona = personaleDisponibile.find(p => p.id === parseInt(personaSelezionata));
        const giaPresente = assegnazioni.find(a => a.id_personale === persona.id);
        if (!giaPresente) {
            setAssegnazioni([...assegnazioni, { id_personale: persona.id, percentuale: 0 }]);
        }
        setPersonaSelezionata("");
    };

    const isValid =
        formData.titolo.trim() !== "" &&
        formData.data_inizio !== "" &&
        formData.durata_presunta > 0 &&
        formData.data_rilascio !== "" &&
        !isNaN(parseFloat(formData.budget?.replace(',', '.')));


    const assegnazioniValide =
        assegnazioni.length > 0 &&
        assegnazioni.every(a => a.percentuale > 0);

    const handleSave = async () => {
        if (!isValid || !assegnazioniValide) {
            showToast("Compila correttamente tutti i campi obbligatori e le assegnazioni", "danger");
            return;
        }

        try {
            const cleanedBudget = formData.budget.replace(/\./g, "").replace(",", ".");
            const budgetFloat = parseFloat(cleanedBudget);

            if (isNaN(budgetFloat)) {
                showToast("Inserisci un budget valido in formato numerico", "danger");
                return;
            }

            const payload = {
                ...formData,
                budget: budgetFloat,
                data_inizio: fixDateForPostgres(formData.data_inizio),
                data_rilascio: fixDateForPostgres(formData.data_rilascio)
            };

            let response;
            if (editing) {
                await axios.put(`http://localhost:3001/api/progetti/${editing.id}`, payload);
                response = { data: { id: editing.id } };
                showToast("Progetto aggiornato con successo!", "success");
            } else {
                response = await axios.post("http://localhost:3001/api/progetti", payload);
                showToast("Nuovo progetto salvato!", "success");
            }

            if (assegnazioni.length > 0) {
                const assegnazioniConGiorni = assegnazioni.map(a => {
                    const percentuale = parseFloat(a.percentuale) || 0;
                    const giorniPrevisti = Math.round((formData.durata_presunta * percentuale) / 100);
                    return {
                        ...a,
                        giorni_previsti: giorniPrevisti
                    };
                });

                await axios.post("http://localhost:3001/api/assegnazioni", {
                    id_progetto: response.data.id,
                    assegnazioni: assegnazioniConGiorni
                });
            }

            resetForm();
            fetchProgetti();
            fetchPersonaleDisponibile();
        } catch (err) {
            console.error("Errore durante il salvataggio:", err);
            showToast("Errore durante il salvataggio", "danger");
        }
    };

    const sortedProgetti = [...progetti]
        .filter(proj => proj.titolo.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];
            if (sortBy.includes("data")) {
                valA = new Date(valA);
                valB = new Date(valB);
            }
            return sortDirection === "asc" ? valA > valB ? 1 : -1 : valA < valB ? 1 : -1;
        });

    const currentItems = sortedProgetti.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(sortedProgetti.length / itemsPerPage);

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container mt-4 flex-grow-1">
                <div className="container mt-4 content-wrapper">
                    {toastMsg && (
                        <div className={`alert alert-${toastType}`} role="alert">
                            {toastMsg}
                        </div>
                    )}

                    <h1 className="text-center">Gestione Progetti</h1>

                    <div className="mb-3 d-flex justify-content-between">
                        <input
                            type="text"
                            className="form-control w-50"
                            placeholder="Cerca per titolo..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <div className="d-flex gap-2">
                            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="titolo">Titolo</option>
                                <option value="data_inizio">Data Inizio</option>
                                <option value="data_rilascio">Data Rilascio</option>
                                <option value="durata_presunta">Durata</option>
                            </select>
                            <select className="form-select" value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                                <option value="asc">⬆️</option>
                                <option value="desc">⬇️</option>
                            </select>
                        </div>
                    </div>

                    {showForm && (
                        <div className="card p-3 mb-4">
                            <h5>{editing ? "Modifica Progetto" : "Nuovo Progetto"}</h5>
                            <div className="row">
                                <div className="mb-3 col-4">
                                    <label className="form-label fw-bold">Titolo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.titolo}
                                        onChange={e => setFormData({ ...formData, titolo: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label fw-bold">Data Inizio</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.data_inizio}
                                        onChange={e => setFormData({ ...formData, data_inizio: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label fw-bold">Data Rilascio</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.data_rilascio}
                                        onChange={e => setFormData({ ...formData, data_rilascio: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label fw-bold">Durata Presunta</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.durata_presunta}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label fw-bold">Budget (€)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Es. 1.000,50"
                                        value={formData.budget}
                                        onChange={(e) => {
                                            setFormData({ ...formData, budget: e.target.value });
                                        }}

                                        onBlur={(e) => {
                                            const cleaned = e.target.value.replace(/\./g, "").replace(",", ".");
                                            const parsed = parseFloat(cleaned);
                                            if (!isNaN(parsed)) {
                                                const formatted = parsed.toLocaleString("it-IT", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                });
                                                setFormData({ ...formData, budget: formatted });
                                            }
                                        }}

                                        required
                                    />

                                </div>

                            </div>

                            <div className="mb-3">
                                <h5>Assegnazioni Personale</h5>
                                <div className="d-flex gap-3 mb-3">
                                    <select className="form-select" value={ruoloSelezionato} onChange={e => setRuoloSelezionato(e.target.value)}>
                                        <option value="">Seleziona ruolo</option>
                                        {[...new Set(personaleDisponibile.map(p => p.ruolo))].map(ruolo => (
                                            <option key={ruolo} value={ruolo}>{ruolo}</option>
                                        ))}
                                    </select>
                                    <select className="form-select" value={personaSelezionata} onChange={e => setPersonaSelezionata(e.target.value)}>
                                        <option value="">Seleziona persona</option>
                                        {personaleDisponibile.filter(p => p.ruolo === ruoloSelezionato).map(p => (
                                            <option key={p.id} value={p.id}>{p.nome} {p.cognome}</option>
                                        ))}
                                    </select>
                                    <button className="btn btn-secondary" onClick={handleAddPerson}>Aggiungi</button>
                                </div>

                                {assegnazioni.map((a, index) => {
                                    const persona = personaleDisponibile.find(p => p.id === a.id_personale);
                                    if (!persona) return null;

                                    const maxDisponibile = 100 - persona.percentuale_impiego;
                                    const percentuale = parseFloat(a.percentuale) || 0;
                                    const giorniPrevisti = Math.round((formData.durata_presunta * percentuale) / 100);

                                    return (
                                        <div key={index} className="row align-items-center border rounded p-2 mb-2">

                                            {/* Colonna 1 - Nome, ruolo e massimo */}
                                            <div className="col-md-4 col-12">
                                                {persona.nome} {persona.cognome} – {persona.ruolo} (max {maxDisponibile}%)
                                            </div>

                                            {/* Colonna 2 - Input percentuale */}
                                            <div className="col-md-3 col-6">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={a.percentuale}
                                                    onChange={(e) => {
                                                        let raw = e.target.value.replace(",", ".");
                                                        let parsed = parseFloat(raw);

                                                        if (!isNaN(parsed)) {
                                                            parsed = Math.max(0, Math.min(parsed, maxDisponibile));
                                                            setAssegnazioni(prev =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, percentuale: parsed } : item
                                                                )
                                                            );
                                                        } else if (e.target.value === "") {
                                                            setAssegnazioni(prev =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, percentuale: "" } : item
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        if (e.target.value === "") {
                                                            setAssegnazioni(prev =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, percentuale: 0 } : item
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Colonna 3 - Giorni previsti */}
                                            <div className="col-md-3 col-6">
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    value={`${giorniPrevisti} gg`}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>

                                            {/* Colonna 4 - Bottone elimina */}
                                            <div className="col-md-2 col-12 text-end">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setAssegnazioni(prev => prev.filter((_, i) => i !== index))}
                                                >
                                                    🖑️
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}


                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-success" onClick={handleSave}>Salva</button>
                                <button className="btn btn-secondary" onClick={resetForm}>Annulla</button>
                            </div>
                        </div>
                    )}

                    <button className="btn btn-primary mb-3" onClick={() => setShowForm(true)}>Nuovo Progetto</button>

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
                                    <td>{new Date(proj.data_inizio).toLocaleDateString("it-IT")}</td>
                                    <td>{proj.durata_presunta} gg</td>
                                    <td>{new Date(proj.data_rilascio).toLocaleDateString("it-IT")}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(proj)}>✏️</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="d-flex justify-content-center mt-3">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Precedente</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Successiva</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progetti;
