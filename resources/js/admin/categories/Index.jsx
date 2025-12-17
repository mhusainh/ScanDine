import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, X } from "lucide-react";
import axios from "axios";
import submitToBlade from "../../global_components/BladeForm/submitToBlade";

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

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
            const response = await axios.get("/api/admin/menu-items");
            setCategories(response.data.categories);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setLoading(false);
        }
    };

    const handleToggleActive = (id) => {
        // Use Blade helper to submit POST request
        submitToBlade(`/admin/categories/${id}/toggle-active`, "POST");
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this category?")) {
            submitToBlade(`/admin/categories/${id}`, "DELETE");
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            submitToBlade(
                `/admin/categories/${editingCategory.id}`,
                "PUT",
                formData
            );
        } else {
            submitToBlade("/admin/categories", "POST", formData);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Category Management
                    </h1>
                    <p className="text-stone-500">Manage menu categories</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-amber-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-amber-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-stone-800">
                                {editingCategory
                                    ? "Edit Category"
                                    : "Add Category"}
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
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-stone-700"
                                >
                                    Active
                                </label>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 text-stone-500 text-sm">
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
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-8 text-center text-stone-500"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-8 text-center text-stone-500"
                                    >
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="hover:bg-stone-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-stone-800">
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(
                                                        category.id
                                                    )
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${
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
                                                    className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-amber-600"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id
                                                        )
                                                    }
                                                    className="p-2 hover:bg-red-50 rounded-lg text-stone-500 hover:text-red-600"
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
