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
import axios from "../../lib/axios";

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
        // setIsLoading(true); // Don't block UI on re-fetch
        try {
            const response = await axios.get(API_ENDPOINT);
            setTables(response.data.data);
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

            if (editingTable) {
                await axios.put(url, formData);
            } else {
                await axios.post(url, formData);
            }

            fetchTables();
            setIsModalOpen(false);
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
            await axios.delete(`${API_ENDPOINT}/${id}`);
            setTables(tables.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Error deleting table:", error);
            alert("Failed to delete table");
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
                    <h1 className="text-2xl font-bold text-coffee-800">
                        Table Management
                    </h1>
                    <p className="text-coffee-500">
                        Manage tables and QR codes
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-coffee-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-coffee-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>Add Table</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-coffee-100">
                        <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-coffee-800">
                                {editingTable ? "Edit Table" : "Add New Table"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-coffee-50 text-coffee-400 hover:text-coffee-600 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-coffee-700 mb-1">
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
                                    className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                    placeholder="e.g. 1, 5, A1"
                                />
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-coffee-200 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-xl font-bold disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-coffee-700 transition-colors shadow-sm"
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
                {isLoading
                    ? [...Array(8)].map((_, i) => (
                          <div
                              key={i}
                              className="bg-white rounded-2xl shadow-sm border border-coffee-100 p-0 overflow-hidden flex flex-col animate-pulse"
                          >
                              <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
                                  <div className="w-40 h-40 bg-gray-200 rounded-xl"></div>
                                  <div className="space-y-2 w-full flex flex-col items-center">
                                      <div className="h-7 bg-gray-200 rounded w-32"></div>
                                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                                  </div>
                              </div>
                              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                                  <div className="flex gap-2">
                                      <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                      <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                  </div>
                              </div>
                          </div>
                      ))
                    : tables.map((table) => (
                          <div
                              key={table.id}
                              className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 group"
                          >
                              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                  <div className="bg-white p-2 rounded-xl border border-coffee-100 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                      <QRCodeCanvas
                                          id={`qr-code-${table.id}`}
                                          value={`${window.location.origin}/menu/${table.uuid}`}
                                          size={150}
                                          level={"H"}
                                          includeMargin={true}
                                      />
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold text-coffee-800">
                                          Table {table.table_number}
                                      </h3>
                                      <p
                                          className={`text-sm font-medium ${
                                              table.status === "available"
                                                  ? "text-green-600"
                                                  : table.status === "occupied"
                                                  ? "text-red-600"
                                                  : "text-coffee-500"
                                          }`}
                                      >
                                          {table.status
                                              .charAt(0)
                                              .toUpperCase() +
                                              table.status.slice(1)}
                                      </p>
                                  </div>
                              </div>

                              <div className="bg-coffee-50/50 p-4 border-t border-coffee-100 flex justify-between items-center">
                                  <button
                                      onClick={() => downloadQR(table)}
                                      className="text-coffee-600 hover:text-coffee-800 font-medium text-sm flex items-center space-x-1 transition-colors"
                                      title="Download QR Code"
                                  >
                                      <Download size={16} />
                                      <span>QR</span>
                                  </button>

                                  <div className="flex space-x-2">
                                      <button
                                          onClick={() => handleOpenModal(table)}
                                          disabled={processingId === table.id}
                                          className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                                      >
                                          <Edit2 size={16} />
                                      </button>
                                      <button
                                          onClick={() => handleDelete(table.id)}
                                          disabled={processingId === table.id}
                                          className="p-2 text-coffee-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
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
                    <div className="col-span-full py-12 text-center text-coffee-500">
                        <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4 text-coffee-400">
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
