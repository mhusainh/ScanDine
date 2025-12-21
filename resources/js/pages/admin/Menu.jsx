import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Power,
    Loader2,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import axios from "../../libs/axios";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import { useToast } from "../../contexts/ToastContext";
import Swal from "sweetalert2";

const AdminMenu = () => {
    const { success, error: toastError } = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [modifierGroups, setModifierGroups] = useState([]);
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
        modifier_groups: [],
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lazy loading states for edit details
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [loadError, setLoadError] = useState(null);

    const [processingId, setProcessingId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchMenuData();
        fetchCategories();
        // Modifier groups are now lazy loaded when modal opens
    }, [currentPage, search, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/admin/categories");
            setCategories(response.data.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

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

            setProducts(response.data.data.data);
            setTotalPages(response.data.data.last_page);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching menu:", error);
            setLoading(false);
        }
    };

    const fetchModifierGroups = async () => {
        try {
            const response = await axios.get("/api/admin/modifier-groups");
            setModifierGroups(response.data.data);
        } catch (error) {
            console.error("Error fetching modifier groups:", error);
        }
    };

    const toggleAvailability = async (id) => {
        if (processingId) return;
        setProcessingId(id);
        try {
            await axios.post(`/api/admin/menu-items/${id}/toggle-availability`);
            setProducts(
                products.map((p) =>
                    p.id === id ? { ...p, is_available: !p.is_available } : p
                )
            );
        } catch (error) {
            console.error("Error toggling availability:", error);
            toastError("Failed to update availability");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Menu Item?',
            text: 'Data yang dihapus tidak dapat dikembalikan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#92400e',
            cancelButtonColor: '#78716c',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-lg px-4 py-2',
                cancelButton: 'rounded-lg px-4 py-2'
            }
        });

        if (!result.isConfirmed) return;

        if (processingId) return;
        setProcessingId(id);

        try {
            await axios.delete(`/api/admin/menu-items/${id}`);
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
            toastError("Failed to delete item");
        } finally {
            setProcessingId(null);
        }
    };

    /**
     * Handle opening the modal with lazy loading implementation.
     *
     * Lazy Loading Flow:
     * 1. Start: Open modal immediately, set isLoadingDetails=true.
     * 2. Progress: Show loading spinner, block interaction.
     * 3. Fetch: Async request to get full product details AND modifier groups (if not loaded).
     * 4. Resources: Wait for image to load (if exists).
     * 5. Success: Populate form data, set isLoadingDetails=false, enable interaction.
     * 6. Error: Show error message with retry button, set loadError state.
     */
    const handleOpenModal = async (product = null) => {
        // Reset states
        setLoadError(null);
        setLoadingStatus("");

        // Start Lazy Loading
        setIsLoadingDetails(true);
        setIsModalOpen(true);

        const startTime = performance.now();
        console.log(`[LazyLoad] Started at ${new Date().toISOString()}`);

        if (product) {
            setEditingProduct(product);

            // Initial optimistic set from list data (basic info)
            setFormData({
                name: product.name,
                category_id: product.category_id,
                price: product.price,
                description: product.description || "",
                is_available: Boolean(product.is_available),
                image: null,
                modifier_groups: [], // Will be populated after fetch
            });
            setImagePreview(product.url_file);

            // Fetch full details and modifier groups if needed
            try {
                setLoadingStatus("Fetching data...");
                const promises = [
                    axios.get(`/api/admin/menu-items/${product.id}`),
                ];

                // Lazy load modifier groups if not already loaded
                if (modifierGroups.length === 0) {
                    promises.push(axios.get("/api/admin/modifier-groups"));
                }

                const responses = await Promise.all(promises);
                const productResponse = responses[0];

                // Handle Modifier Groups response if it was fetched
                if (responses.length > 1) {
                    const groupsResponse = responses[1];
                    if (groupsResponse.data.success) {
                        setModifierGroups(groupsResponse.data.data);
                        console.log(
                            `[LazyLoad] Loaded ${groupsResponse.data.data.length} modifier groups`
                        );
                    }
                }

                if (productResponse.data.success) {
                    const fullProduct = productResponse.data.data;
                    setFormData((prev) => ({
                        ...prev,
                        modifier_groups: fullProduct.modifier_groups
                            ? fullProduct.modifier_groups.map((g) => g.id)
                            : [],
                    }));

                    // Resource Loading (Image)
                    if (fullProduct.url_file) {
                        setLoadingStatus("Loading resources...");
                        try {
                            await new Promise((resolve) => {
                                const img = new Image();
                                img.src = fullProduct.url_file;
                                img.onload = resolve;
                                img.onerror = resolve; // Don't block on error
                            });
                        } catch (imgError) {
                            console.warn(
                                "[LazyLoad] Image preload warning:",
                                imgError
                            );
                        }
                    }

                    // Loading Finished Successfully
                    const endTime = performance.now();
                    console.log(
                        `[LazyLoad] Finished in ${(endTime - startTime).toFixed(
                            2
                        )}ms`
                    );
                    setLoadingStatus("Ready");
                    setIsLoadingDetails(false);
                } else {
                    throw new Error("Failed to fetch details");
                }
            } catch (error) {
                console.error("[LazyLoad] Error:", error);
                setLoadError(
                    "Failed to load data. Please check your connection."
                );
                setIsLoadingDetails(false);
            }
        } else {
            // Add Mode
            setEditingProduct(null);
            setFormData({
                name: "",
                category_id: "",
                price: "",
                description: "",
                is_available: true,
                image: null,
                modifier_groups: [],
            });
            setImagePreview(null);

            // Lazy load modifier groups if not already loaded
            if (modifierGroups.length === 0) {
                try {
                    setLoadingStatus("Loading dependencies...");
                    const response = await axios.get(
                        "/api/admin/modifier-groups"
                    );
                    if (response.data.success) {
                        setModifierGroups(response.data.data);
                        console.log(
                            `[LazyLoad] Loaded ${response.data.data.length} modifier groups`
                        );
                    }
                    const endTime = performance.now();
                    console.log(
                        `[LazyLoad] Finished in ${(endTime - startTime).toFixed(
                            2
                        )}ms`
                    );
                    setIsLoadingDetails(false);
                } catch (error) {
                    console.error(
                        "[LazyLoad] Error fetching modifier groups:",
                        error
                    );
                    setLoadError("Failed to load modifier groups.");
                    setIsLoadingDetails(false);
                }
            } else {
                setIsLoadingDetails(false);
            }
        }
    };

    // Retry handler for lazy loading failure
    const handleRetryLoad = () => {
        if (editingProduct) {
            handleOpenModal(editingProduct);
        }
    };

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation: File Type
            if (!file.type.startsWith("image/")) {
                toastError(
                    "Please upload a valid image file (JPG, PNG, WebP)."
                );
                return;
            }

            // Validation: File Size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toastError("Image size must be less than 2MB.");
                return;
            }

            try {
                setFormData({ ...formData, image: file });
                // Use createObjectURL instead of FileReader to prevent memory issues and crashes
                const objectUrl = URL.createObjectURL(file);
                setImagePreview(objectUrl);
            } catch (error) {
                console.error("Error creating image preview:", error);
                toastError("Failed to process image. Please try another file.");
            }
        }
    };

    const handleModifierGroupChange = (groupId) => {
        const currentGroups = [...formData.modifier_groups];
        const index = currentGroups.indexOf(groupId);
        if (index > -1) {
            currentGroups.splice(index, 1);
        } else {
            currentGroups.push(groupId);
        }
        setFormData({ ...formData, modifier_groups: currentGroups });
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

        // Append modifier groups
        if (formData.modifier_groups.length > 0) {
            formData.modifier_groups.forEach((id) => {
                data.append("modifier_groups[]", id);
            });
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
            success(
                editingProduct
                    ? "Menu item updated successfully"
                    : "Menu item created successfully"
            );
        } catch (error) {
            console.error("Error saving menu item:", error);
            toastError("Failed to save menu item. Please check your input.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-800">
                        Menu Management
                    </h1>
                    <p className="text-coffee-500">
                        Add, edit, or remove menu items
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto bg-coffee-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-coffee-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add New Item</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-coffee-100">
                        <div className="p-6 border-b border-coffee-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-coffee-800">
                                {editingProduct
                                    ? "Edit Menu Item"
                                    : "Add New Menu Item"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-coffee-50 text-coffee-400 hover:text-coffee-600 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-6 relative"
                        >
                            {/* Lazy Loading Overlay */}
                            {(isLoadingDetails || loadError) && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-b-2xl">
                                    {isLoadingDetails ? (
                                        <>
                                            <Loader2 className="w-10 h-10 text-coffee-600 animate-spin mb-3" />
                                            <p className="text-coffee-600 font-medium">
                                                Loading product details...
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <p className="text-red-500 font-medium mb-4">
                                                {loadError}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleRetryLoad}
                                                className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors font-medium"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
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
                                            className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white"
                                        >
                                            <option value="">
                                                Select Category
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                            Price
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-500">
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
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
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
                                            className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                            Image
                                        </label>
                                        <div className="border-2 border-dashed border-coffee-200 rounded-xl p-4 text-center hover:bg-coffee-50 transition-colors relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {imagePreview ? (
                                                <div className="relative h-40 w-full">
                                                    <ImageWithFallback
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain rounded-lg"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-coffee-400">
                                                    <ImageIcon
                                                        size={32}
                                                        className="mb-2"
                                                    />
                                                    <span className="text-sm">
                                                        Click to upload image
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-coffee-700 mb-2">
                                            Modifier Groups
                                        </label>
                                        <div className="border border-coffee-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                                            {modifierGroups.length === 0 ? (
                                                <p className="text-sm text-coffee-400 text-center">
                                                    No modifier groups available
                                                </p>
                                            ) : (
                                                modifierGroups.map((group) => (
                                                    <div
                                                        key={group.id}
                                                        className="flex items-center"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`group-${group.id}`}
                                                            checked={formData.modifier_groups.includes(
                                                                group.id
                                                            )}
                                                            onChange={() =>
                                                                handleModifierGroupChange(
                                                                    group.id
                                                                )
                                                            }
                                                            className="w-4 h-4 text-coffee-600 rounded focus:ring-coffee-500 border-coffee-300"
                                                        />
                                                        <label
                                                            htmlFor={`group-${group.id}`}
                                                            className="ml-2 text-sm text-coffee-700 cursor-pointer"
                                                        >
                                                            {group.name}
                                                            <span className="text-xs text-coffee-400 ml-1">
                                                                (
                                                                {group.type ===
                                                                "single"
                                                                    ? "Pick 1"
                                                                    : "Pick Many"}
                                                                )
                                                            </span>
                                                        </label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_available"
                                            checked={formData.is_available}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    is_available:
                                                        e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-coffee-600 rounded focus:ring-coffee-500"
                                        />
                                        <label
                                            htmlFor="is_available"
                                            className="text-sm font-medium text-coffee-700"
                                        >
                                            Available for Order
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-coffee-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-coffee-200 text-coffee-600 rounded-xl hover:bg-coffee-50 transition-colors font-medium"
                                    disabled={isLoadingDetails}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        isLoadingDetails ||
                                        loadError
                                    }
                                    className="px-6 py-2 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>
                                            {editingProduct
                                                ? "Save Changes"
                                                : "Create Item"}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
                {/* Search & Filter */}
                <div className="p-4 border-b border-coffee-100 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white"
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
                        <thead className="bg-coffee-50 text-coffee-500 text-sm">
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
                        <tbody className="divide-y divide-coffee-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                                                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-8 text-center text-coffee-500"
                                    >
                                        No menu items found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-coffee-50 transition-colors"
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
                                                <div className="font-medium text-coffee-800">
                                                    {product.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-coffee-600">
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
                                                disabled={
                                                    processingId === product.id
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    product.is_available
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                }`}
                                            >
                                                {processingId === product.id ? (
                                                    <Loader2
                                                        size={12}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Power size={12} />
                                                )}
                                                <span>
                                                    {product.is_available
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(product)
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        product.id
                                                    }
                                                    className="p-2 hover:bg-coffee-100 rounded-lg text-coffee-500 hover:text-coffee-600 disabled:opacity-50"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    disabled={
                                                        processingId ===
                                                        product.id
                                                    }
                                                    className="p-2 hover:bg-red-50 rounded-lg text-coffee-500 hover:text-red-600 disabled:opacity-50"
                                                >
                                                    {processingId ===
                                                    product.id ? (
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
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
                <div className="p-4 border-t border-coffee-100 flex justify-between items-center">
                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className="px-4 py-2 border border-coffee-200 rounded-lg text-sm disabled:opacity-50 hover:bg-coffee-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-coffee-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="px-4 py-2 border border-coffee-200 rounded-lg text-sm disabled:opacity-50 hover:bg-coffee-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminMenu;
