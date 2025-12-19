import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, X } from "lucide-react";
import axios from "../../lib/axios";

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/admin/categories");
            setCategories(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        if (loading) return; // Basic prevention
        try {
            await axios.post(`/api/admin/categories/${id}/toggle-active`);
            // Optimistic update
            setCategories(
                categories.map((cat) =>
                    cat.id === id ? { ...cat, is_active: !cat.is_active } : cat
                )
            );
        } catch (error) {
            console.error("Error toggling category status:", error);
            alert("Failed to toggle status");
            fetchCategories(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await axios.delete(`/api/admin/categories/${id}`);
                setCategories(categories.filter((cat) => cat.id !== id));
            } catch (error) {
                console.error("Error deleting category:", error);
                alert(
                    "Failed to delete category: " +
                        (error.response?.data?.message || error.message)
                );
            }
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                sort_order: category.sort_order,
                is_active: Boolean(category.is_active),
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: "", sort_order: 0, is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingCategory) {
                await axios.put(
                    `/api/admin/categories/${editingCategory.id}`,
                    formData
                );
            } else {
                await axios.post("/api/admin/categories", formData);
            }
            fetchCategories();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-800">
                        Category Management
                    </h1>
                    <p className="text-coffee-500">Manage menu categories</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-coffee-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-coffee-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-coffee-100">
                        <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-coffee-800">
                                {editingCategory
                                    ? "Edit Category"
                                    : "Add Category"}
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
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sort_order: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 text-coffee-600 rounded focus:ring-coffee-500 border-coffee-300"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-coffee-700"
                                >
                                    Active
                                </label>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-coffee-200 rounded-xl font-bold text-coffee-600 hover:bg-coffee-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-xl font-bold hover:bg-coffee-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-coffee-50/50 text-coffee-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-coffee-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-5 bg-gray-200 rounded w-32"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-8 text-center text-coffee-500"
                                    >
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="hover:bg-coffee-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-coffee-800">
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(
                                                        category.id
                                                    )
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${
                                                    category.is_active
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                }`}
                                            >
                                                <Power size={12} />
                                                <span>
                                                    {category.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(
                                                            category
                                                        )
                                                    }
                                                    className="p-2 hover:bg-coffee-50 rounded-lg text-coffee-400 hover:text-coffee-600 transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id
                                                        )
                                                    }
                                                    className="p-2 hover:bg-red-50 rounded-lg text-coffee-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
