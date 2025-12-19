import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    QrCode,
    Download,
    X,
    Loader2,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const AdminTables = () => {
    // State
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [formData, setFormData] = useState({ table_number: "" });

    const API_ENDPOINT =
        import.meta.env.VITE_API_TABLES_ENDPOINT || "/api/admin/tables";

    const [processingId, setProcessingId] = useState(null);

    // Fetch Tables
    const fetchTables = async () => {
        try {
            const response = await fetch(API_ENDPOINT);
            const data = await response.json();
            setTables(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching tables:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    // Handlers
    const handleOpenModal = (table = null) => {
        if (table) {
            setEditingTable(table);
            setFormData({ table_number: table.table_number });
        } else {
            setEditingTable(null);
            setFormData({ table_number: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingTable
                ? `${API_ENDPOINT}/${editingTable.id}`
                : API_ENDPOINT;

            const method = editingTable ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchTables();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error saving table:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (processingId) return;

        if (!confirm("Are you sure you want to delete this table?")) return;

        setProcessingId(id);
        try {
            const response = await fetch(`${API_ENDPOINT}/${id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            if (response.ok) {
                // Optimistic update
                setTables(tables.filter((t) => t.id !== id));
            } else {
                alert("Cannot delete table. It might have active orders.");
                fetchTables(); // Sync with server
            }
        } catch (error) {
            console.error("Error deleting table:", error);
            fetchTables();
        } finally {
            setProcessingId(null);
        }
    };

    // Download QR
    const downloadQR = (table) => {
        const canvas = document.getElementById(`qr-code-${table.id}`);
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `table-${table.table_number}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Table Management
                    </h1>
                    <p className="text-stone-500">Manage tables and QR codes</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-amber-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-amber-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Table</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-stone-800">
                                {editingTable ? "Edit Table" : "Add New Table"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Table Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.table_number}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            table_number: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="e.g. 1, 5, A1"
                                />
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-xl font-bold disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-xl font-bold disabled:opacity-70 flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2
                                                size={20}
                                                className="animate-spin"
                                            />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col"
                    >
                        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-white p-2 rounded-xl border border-stone-100 shadow-sm">
                                <QRCodeCanvas
                                    id={`qr-code-${table.id}`}
                                    value={`${window.location.origin}/menu/${table.uuid}`}
                                    size={150}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-stone-800">
                                    Table {table.table_number}
                                </h3>
                                <p
                                    className={`text-sm font-medium ${
                                        table.status === "available"
                                            ? "text-green-600"
                                            : table.status === "occupied"
                                            ? "text-red-600"
                                            : "text-stone-500"
                                    }`}
                                >
                                    {table.status.charAt(0).toUpperCase() +
                                        table.status.slice(1)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-between items-center">
                            <button
                                onClick={() => downloadQR(table)}
                                className="text-stone-600 hover:text-amber-700 font-medium text-sm flex items-center space-x-1"
                                title="Download QR Code"
                            >
                                <Download size={16} />
                                <span>QR</span>
                            </button>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleOpenModal(table)}
                                    disabled={processingId === table.id}
                                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(table.id)}
                                    disabled={processingId === table.id}
                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {processingId === table.id ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {tables.length === 0 && !isLoading && (
                    <div className="col-span-full py-12 text-center text-stone-500">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <QrCode size={32} />
                        </div>
                        <p>
                            No tables found. Add your first table to get
                            started.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTables;
