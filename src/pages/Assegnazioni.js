import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
} from "recharts";
import * as XLSX from "xlsx";
import { FaUsers, FaChartPie, FaChartBar } from "react-icons/fa";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c"];

// Colori per soglie
const getBarColor = (val) => {
    if (val >= 80) return "#dc3545";       // Rosso
    if (val >= 50) return "#fd7e14";       // Arancione
    return "#28a745";                      // Verde
};

// Legenda personalizzata
const CustomLegend = () => (
    <div className="mb-3 d-flex align-items-center gap-3">
        <span><span className="badge bg-success me-1">&nbsp;</span> <small>Fino al 49%</small></span>
        <span><span className="badge bg-warning me-1">&nbsp;</span> <small>Dal 50% al 79%</small></span>
        <span><span className="badge bg-danger me-1">&nbsp;</span> <small>80% o oltre</small></span>
    </div>
);

// Label centrato dentro la barra
const CustomLabel = ({ x, y, width, height, value }) => {
    const cx = x + width / 2;
    const cy = y + height / 2 + 4; // +4 per allineamento verticale
    return (
        <text x={cx} y={cy} fill="#fff" fontSize={14} textAnchor="middle">
            {value}%
        </text>
    );
};

const Dashboard = () => {
    const [caricoPersonale, setCaricoPersonale] = useState([]);
    const [personePerProgetto, setPersonePerProgetto] = useState([]);
    const [distribuzioneRuoli, setDistribuzioneRuoli] = useState([]);
    const [activeTab, setActiveTab] = useState("carico");
    const printRef = useRef();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const carico = await axios.get("http://localhost:3001/api/personale");
            const assegnazioni = await axios.get("http://localhost:3001/api/assegnazioni");

            const caricoData = carico.data.map(p => ({
                nome: `${p.nome} ${p.cognome}`,
                percentuale: p.percentuale_impiego,
            }));
            setCaricoPersonale(caricoData);

            const progettoMap = {};
            assegnazioni.data.forEach(a => {
                progettoMap[a.progetto] = (progettoMap[a.progetto] || 0) + 1;
            });
            setPersonePerProgetto(Object.entries(progettoMap).map(([name, value]) => ({ name, value })));

            const ruoloMap = {};
            carico.data.forEach(p => {
                ruoloMap[p.ruolo] = (ruoloMap[p.ruolo] || 0) + 1;
            });
            setDistribuzioneRuoli(Object.entries(ruoloMap).map(([name, value]) => ({ name, value })));
        } catch (err) {
            console.error("Errore nel caricamento dati dashboard", err);
        }
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        const caricoSheet = XLSX.utils.json_to_sheet(caricoPersonale);
        XLSX.utils.book_append_sheet(wb, caricoSheet, "Carico Personale");

        const progettiSheet = XLSX.utils.json_to_sheet(personePerProgetto);
        XLSX.utils.book_append_sheet(wb, progettiSheet, "Persone per Progetto");

        const ruoliSheet = XLSX.utils.json_to_sheet(distribuzioneRuoli);
        XLSX.utils.book_append_sheet(wb, ruoliSheet, "Distribuzione Ruoli");

        XLSX.writeFile(wb, `dashboard_${Date.now()}.xlsx`);
    };

    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container mt-4 flex-grow-1">
                <div className="container mt-4 content-wrapper">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="fw-bold">Status Allocazione</h2>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-success" onClick={exportToExcel}>Esporta</button>
                            <button className="btn btn-outline-primary" onClick={handlePrint}>Stampa</button>
                        </div>
                    </div>

                    <ul className="nav nav-tabs mb-3">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "carico" && "active"}`}
                                onClick={() => setActiveTab("carico")}
                            >
                                <FaUsers className="me-1" /> Carico Personale <span className="badge bg-secondary ms-1">{caricoPersonale.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "progetti" && "active"}`}
                                onClick={() => setActiveTab("progetti")}
                            >
                                <FaChartBar className="me-1" /> Persone per Progetto <span className="badge bg-secondary ms-1">{personePerProgetto.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "ruoli" && "active"}`}
                                onClick={() => setActiveTab("ruoli")}
                            >
                                <FaChartPie className="me-1" /> Distribuzione Ruoli <span className="badge bg-secondary ms-1">{distribuzioneRuoli.length}</span>
                            </button>
                        </li>
                    </ul>

                    <div className="card p-3" ref={printRef}>
                        {activeTab === "carico" && (
                            <>
                                <CustomLegend />

                                <ResponsiveContainer width="100%" height={caricoPersonale.length * 45}>
                                    <BarChart
                                        data={caricoPersonale}
                                        layout="vertical"
                                        margin={{ top: 10, bottom: 20, left: 100, right: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis dataKey="nome" type="category" width={200} interval={0} />
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Bar
                                            dataKey="percentuale"
                                            name="% Impiego"
                                            label={<CustomLabel />}
                                        >
                                            {caricoPersonale.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentuale)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>

                        )}

                        {activeTab === "progetti" && (
                            <ResponsiveContainer width="100%" height={500}>
                                <BarChart data={personePerProgetto} margin={{ bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={100} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#82ca9d" name="# Persone" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {activeTab === "ruoli" && (
                            <ResponsiveContainer width="100%" height={500}>
                                <PieChart>
                                    <Pie
                                        data={distribuzioneRuoli}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        label
                                    >
                                        {distribuzioneRuoli.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
