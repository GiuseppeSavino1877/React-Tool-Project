import React from "react";

const ModalPersonale = ({ show, editing, formData, setFormData, onClose, onSave }) => {
    if (!show) return null;

    const isValid =
        formData.matricola.trim() !== "" &&
        formData.df.trim() !== "" &&
        formData.nome.trim() !== "" &&
        formData.cognome.trim() !== "" &&
        formData.ruolo.trim() !== "" &&
        !isNaN(formData.percentuale_impiego) &&
        formData.percentuale_impiego >= 0 &&
        formData.percentuale_impiego <= 100;

    return (
        <div className="modal show fade d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {editing ? "Modifica Risorsa" : "Nuova Risorsa"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="row">
                                <div className="mb-3 col-4">
                                    <label className="form-label">Matricola *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.matricola}
                                        onChange={(e) => setFormData({ ...formData, matricola: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label">DF *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.df}
                                        onChange={(e) => setFormData({ ...formData, df: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label">Nome *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label">Cognome *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.cognome}
                                        onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label">Ruolo *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.ruolo}
                                        onChange={(e) => setFormData({ ...formData, ruolo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3 col-4">
                                    <label className="form-label">Percentuale Impiego (%) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.percentuale_impiego}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                percentuale_impiego: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        min="0"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Chiudi
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onSave}
                            disabled={!isValid}
                            title={!isValid ? "Compila tutti i campi correttamente" : ""}
                        >
                            Salva
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPersonale;
