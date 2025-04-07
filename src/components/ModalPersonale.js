import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ModalPersonale = ({ show, editing, formData, setFormData, onClose, onSave }) => {
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
        <Modal
            show={show}
            onHide={onClose}
            size="lg"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {editing ? "Modifica Risorsa" : "Nuova Risorsa"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label>Matricola *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.matricola}
                                onChange={(e) => setFormData({ ...formData, matricola: e.target.value })}
                                required
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label>DF *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.df}
                                onChange={(e) => setFormData({ ...formData, df: e.target.value })}
                                required
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Nome *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label>Cognome *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.cognome}
                                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                                required
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Ruolo *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.ruolo}
                                onChange={(e) => setFormData({ ...formData, ruolo: e.target.value })}
                                required
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Percentuale Impiego (%) *</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.percentuale_impiego}
                                min={0}
                                max={100}
                                disabled
                                required
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onClose}>
                    Chiudi
                </Button>
                <Button
                    variant="success"
                    onClick={onSave}
                    disabled={!isValid}
                    title={!isValid ? "Compila tutti i campi correttamente" : ""}
                >
                    Salva
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalPersonale;
