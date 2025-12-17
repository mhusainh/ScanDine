import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import axios from "axios";

const AdminMenu = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        description: "",
        is_available: true,
        image: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchMenuData();
    }, [currentPage, search, selectedCategory]);

    const fetchMenuData = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: search,
                category_id: selectedCategory,
            };
            const response = await axios.get("/api/admin/menu-items", {
                params,
            });

            setProducts(response.data.menuItems.data);
            setCategories(response.data.categories);
            setTotalPages(response.data.menuItems.last_page);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching menu:", error);
            setLoading(false);
        }
    };

    const toggleAvailability = async (id) => {
        try {
            await axios.post(`/api/admin/menu-items/${id}/toggle-availability`);
            setProducts(
                products.map((p) =>
                    p.id === id ? { ...p, is_available: !p.is_available } : p
                )
            );
        } catch (error) {
            console.error("Error toggling availability:", error);
            alert("Failed to update availability");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?"))
            return;

        try {
            await axios.delete(`/api/admin/menu-items/${id}`);
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item");
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category_id: product.category_id,
                price: product.price,
                description: product.description || "",
                is_available: Boolean(product.is_available),
                image: null,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                category_id: "",
                price: "",
                description: "",
                is_available: true,
                image: null,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category_id", formData.category_id);
        data.append("price", formData.price);
        data.append("description", formData.description);
        data.append("is_available", formData.is_available ? "1" : "0");
        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            if (editingProduct) {
                // For PUT request with file upload in Laravel, we need to use POST with _method=PUT
                data.append("_method", "PUT");
                await axios.post(
                    `/api/admin/menu-items/${editingProduct.id}`,
                    data,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
            } else {
                await axios.post("/api/admin/menu-items", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            setIsModalOpen(false);
            fetchMenuData(); // Refresh list
        } catch (error) {
            console.error("Error saving menu item:", error);
            alert("Failed to save menu item. Please check your input.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Menu Management
                    </h1>
                    <p className="text-stone-500">
                        Add, edit, or remove menu items
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-amber-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-amber-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add New Item</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-stone-800">
                                {editingProduct
                                    ? "Edit Menu Item"
                                    : "Add New Menu Item"}
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
                                    Category
                                </label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category_id: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            image: e.target.files[0],
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <p className="text-xs text-stone-500 mt-1">
                                    Leave empty to keep current image
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    checked={formData.is_available}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_available: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                />
                                <label
                                    htmlFor="is_available"
                                    className="text-sm font-medium text-stone-700"
                                >
                                    Available for Order
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
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                {/* Search & Filter */}
                <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 text-stone-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">
                                    Product Name
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Price
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
                                        colSpan="5"
                                        className="px-6 py-8 text-center text-stone-500"
                                    >
                                        Loading menu items...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-8 text-center text-stone-500"
                                    >
                                        No menu items found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-stone-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {product.url_file && (
                                                    <img
                                                        src={product.url_file}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="font-medium text-stone-800">
                                                    {product.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-600">
                                            {product.category?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Rp{" "}
                                            {parseInt(
                                                product.price
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    toggleAvailability(
                                                        product.id
                                                    )
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                    product.is_available
                                                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                                }`}
                                            >
                                                {product.is_available
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(product)
                                                    }
                                                    className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-amber-600 transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    className="p-2 hover:bg-red-50 rounded-lg text-stone-500 hover:text-red-600 transition-colors"
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

                {/* Pagination (Simple) */}
                <div className="p-4 border-t border-stone-100 flex justify-between items-center">
                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 hover:bg-stone-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-stone-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 hover:bg-stone-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminMenu;
