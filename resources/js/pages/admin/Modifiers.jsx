import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    Layers,
    ChevronDown,
    ChevronRight,
    X,
    DollarSign,
    Loader2,
} from "lucide-react";
import axios from "../../libs/axios";
import { useToast } from "../../contexts/ToastContext";
import Swal from "sweetalert2";

const AdminModifiers = () => {
    const { success, error: toastError } = useToast();
    const [modifierGroups, setModifierGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({}); // Map of groupId -> items
    const [loadingItems, setLoadingItems] = useState({}); // Map of groupId -> bool

    // Idempotency & Loading State
    const [processingId, setProcessingId] = useState(null); // Stores ID of item/group being processed

    // Group Modal State
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({
        name: "",
        type: "single",
        min_selection: 0,
        max_selection: 1,
        is_required: false,
    });

    // Item Modal State
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [itemForm, setItemForm] = useState({
        name: "",
        price: 0,
        is_available: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchModifierGroups();
    }, []);

    const fetchModifierGroups = async () => {
        try {
            const response = await axios.get("/api/admin/modifier-groups");
            setModifierGroups(response.data.data);
        } catch (error) {
            console.error("Error fetching modifier groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModifierItems = async (groupId) => {
        setLoadingItems((prev) => ({ ...prev, [groupId]: true }));
        try {
            const response = await axios.get(
                `/api/admin/modifier-groups/${groupId}/modifier-items`
            );
            setExpandedGroups((prev) => ({
                ...prev,
                [groupId]: response.data.data.modifier_items,
            }));
        } catch (error) {
            console.error("Error fetching modifier items:", error);
        } finally {
            setLoadingItems((prev) => ({ ...prev, [groupId]: false }));
        }
    };

    const toggleGroupExpand = (groupId) => {
        if (expandedGroups[groupId]) {
            // Collapse: remove from expandedGroups
            const newExpanded = { ...expandedGroups };
            delete newExpanded[groupId];
            setExpandedGroups(newExpanded);
        } else {
            // Expand: fetch items
            fetchModifierItems(groupId);
        }
    };

    // --- Group Operations ---
    const handleOpenGroupModal = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setGroupForm({
                name: group.name,
                type: group.type,
                min_selection: group.min_selection,
                max_selection: group.max_selection,
                is_required: Boolean(group.is_required),
            });
        } else {
            setEditingGroup(null);
            setGroupForm({
                name: "",
                type: "single",
                min_selection: 0,
                max_selection: 1,
                is_required: false,
            });
        }
        setIsGroupModalOpen(true);
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingGroup) {
                await axios.put(
                    `/api/admin/modifier-groups/${editingGroup.id}`,
                    groupForm
                );
            } else {
                await axios.post("/api/admin/modifier-groups", groupForm);
            }
            fetchModifierGroups();
            setIsGroupModalOpen(false);
        } catch (error) {
            console.error("Error saving modifier group:", error);
            alert("Failed to save modifier group");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (processingId) return;

        const result = await Swal.fire({
            title: 'Hapus Modifier Group?',
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

        if (result.isConfirmed) {
            setProcessingId(id);
            try {
                await axios.delete(`/api/admin/modifier-groups/${id}`);
                setModifierGroups(modifierGroups.filter((g) => g.id !== id));
                success("Modifier group deleted successfully");
            } catch (error) {
                console.error("Error deleting group:", error);
                toastError(
                    "Failed to delete group: " +
                        (error.response?.data?.message || error.message)
                );
            } finally {
                setProcessingId(null);
            }
        }
    };

    // --- Item Operations ---
    const handleOpenItemModal = (groupId, item = null) => {
        setActiveGroupId(groupId);
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                price: item.price,
                is_available: Boolean(item.is_available),
            });
        } else {
            setEditingItem(null);
            setItemForm({ name: "", price: 0, is_available: true });
        }
        setIsItemModalOpen(true);
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await axios.put(
                    `/api/admin/modifier-groups/${activeGroupId}/modifier-items/${editingItem.id}`,
                    itemForm
                );
            } else {
                await axios.post(
                    `/api/admin/modifier-groups/${activeGroupId}/modifier-items`,
                    itemForm
                );
            }
            fetchModifierItems(activeGroupId);
            setIsItemModalOpen(false);
        } catch (error) {
            console.error("Error saving modifier item:", error);
            alert("Failed to save modifier item");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleItemAvailable = async (groupId, itemId) => {
        if (processingId) return;
        setProcessingId(itemId);
        try {
            await axios.post(
                `/api/admin/modifier-groups/${groupId}/modifier-items/${itemId}/toggle-available`
            );
            // Optimistic update
            const newItems = expandedGroups[groupId].map((item) =>
                item.id === itemId
                    ? { ...item, is_available: !item.is_available }
                    : item
            );
            setExpandedGroups({
                ...expandedGroups,
                [groupId]: newItems,
            });
        } catch (error) {
            console.error("Error toggling item availability:", error);
            fetchModifierItems(groupId); // Revert on error
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteItem = async (groupId, itemId) => {
        if (processingId) return;

        const result = await Swal.fire({
            title: 'Hapus Modifier Item?',
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

        if (result.isConfirmed) {
            setProcessingId(itemId);
            try {
                await axios.delete(
                    `/api/admin/modifier-groups/${groupId}/modifier-items/${itemId}`
                );
                // Optimistic update
                const newItems = expandedGroups[groupId].filter(
                    (item) => item.id !== itemId
                );
                setExpandedGroups({
                    ...expandedGroups,
                    [groupId]: newItems,
                });
                success("Modifier item deleted successfully");
            } catch (error) {
                console.error("Error deleting item:", error);
                toastError("Failed to delete item");
                fetchModifierItems(groupId);
            } finally {
                setProcessingId(null);
            }
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-800">
                        Modifier Management
                    </h1>
                    <p className="text-coffee-500">
                        Manage modifier groups and items
                    </p>
                </div>
                <button
                    onClick={() => handleOpenGroupModal()}
                    className="w-full sm:w-auto bg-coffee-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-coffee-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add Modifier Group</span>
                </button>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl shadow-sm border border-coffee-100 p-4 animate-pulse"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                        <div className="flex gap-2">
                                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                                            <div className="h-5 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                                    <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                                    <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : modifierGroups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-coffee-300">
                    <p className="text-coffee-500">No modifier groups found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {modifierGroups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden"
                        >
                            <div className="p-4 flex items-center justify-between hover:bg-coffee-50/50 transition-colors">
                                <div
                                    className="flex items-center space-x-4 cursor-pointer flex-1"
                                    onClick={() => toggleGroupExpand(group.id)}
                                >
                                    <button className="text-coffee-400">
                                        {expandedGroups[group.id] ? (
                                            <ChevronDown size={20} />
                                        ) : (
                                            <ChevronRight size={20} />
                                        )}
                                    </button>
                                    <div>
                                        <h3 className="font-bold text-coffee-800 text-lg">
                                            {group.name}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-sm text-coffee-500">
                                            <span className="capitalize px-2 py-0.5 bg-coffee-100 rounded text-coffee-600">
                                                {group.type}
                                            </span>
                                            {group.is_required && (
                                                <span className="text-red-500 font-medium">
                                                    Required
                                                </span>
                                            )}
                                            <span>
                                                • Min: {group.min_selection}
                                            </span>
                                            <span>
                                                • Max:{" "}
                                                {group.max_selection || "Unl."}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() =>
                                            handleOpenItemModal(group.id)
                                        }
                                        className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-lg flex items-center space-x-1"
                                        title="Add Item"
                                    >
                                        <Plus size={18} />
                                        <span className="hidden sm:inline text-sm font-medium">
                                            Add Item
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleOpenGroupModal(group)
                                        }
                                        disabled={processingId === group.id}
                                        className="p-2 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded-lg disabled:opacity-50"
                                        title="Edit Group"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteGroup(group.id)
                                        }
                                        disabled={processingId === group.id}
                                        className="p-2 text-coffee-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                        title="Delete Group"
                                    >
                                        {processingId === group.id ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Items */}
                            {expandedGroups[group.id] && (
                                <div className="bg-coffee-50/30 border-t border-coffee-100 p-4 pl-12">
                                    {loadingItems[group.id] ? (
                                        <div className="text-sm text-coffee-500">
                                            Loading items...
                                        </div>
                                    ) : expandedGroups[group.id].length ===
                                      0 ? (
                                        <div className="text-sm text-coffee-500 italic">
                                            No items in this group.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {expandedGroups[group.id].map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        className="bg-white p-3 rounded-xl border border-coffee-200 flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <div className="font-medium text-coffee-800">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-sm text-coffee-600 font-medium flex items-center">
                                                                <DollarSign
                                                                    size={12}
                                                                    className="mr-0.5"
                                                                />
                                                                {parseInt(
                                                                    item.price
                                                                ).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleItemAvailable(
                                                                        group.id,
                                                                        item.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    processingId ===
                                                                    item.id
                                                                }
                                                                className={`text-xs px-2 py-1 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                    item.is_available
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-red-100 text-red-700"
                                                                }`}
                                                            >
                                                                {processingId ===
                                                                item.id ? (
                                                                    <Loader2
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="animate-spin"
                                                                    />
                                                                ) : item.is_available ? (
                                                                    "Avail"
                                                                ) : (
                                                                    "Unavail"
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenItemModal(
                                                                        group.id,
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    processingId ===
                                                                    item.id
                                                                }
                                                                className="p-1.5 text-coffee-400 hover:text-coffee-600 hover:bg-coffee-100 rounded disabled:opacity-50"
                                                            >
                                                                <Edit2
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteItem(
                                                                        group.id,
                                                                        item.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    processingId ===
                                                                    item.id
                                                                }
                                                                className="p-1.5 text-coffee-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                            >
                                                                {processingId ===
                                                                item.id ? (
                                                                    <Loader2
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-coffee-800">
                                {editingGroup
                                    ? "Edit Group"
                                    : "Add Modifier Group"}
                            </h2>
                            <button
                                onClick={() => setIsGroupModalOpen(false)}
                                className="p-2 hover:bg-coffee-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleGroupSubmit}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={groupForm.name}
                                    onChange={(e) =>
                                        setGroupForm({
                                            ...groupForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-coffee-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={groupForm.type}
                                        onChange={(e) =>
                                            setGroupForm({
                                                ...groupForm,
                                                type: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-xl border border-coffee-200 bg-white"
                                    >
                                        <option value="single">
                                            Single Choice
                                        </option>
                                        <option value="multiple">
                                            Multiple Choice
                                        </option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        id="req"
                                        checked={groupForm.is_required}
                                        onChange={(e) =>
                                            setGroupForm({
                                                ...groupForm,
                                                is_required: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-coffee-600 rounded"
                                    />
                                    <label
                                        htmlFor="req"
                                        className="ml-2 text-sm font-medium text-coffee-700"
                                    >
                                        Required
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                                        Min Selection
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={groupForm.min_selection}
                                        onChange={(e) =>
                                            setGroupForm({
                                                ...groupForm,
                                                min_selection: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-xl border border-coffee-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                                        Max Selection
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={groupForm.max_selection}
                                        onChange={(e) =>
                                            setGroupForm({
                                                ...groupForm,
                                                max_selection: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-xl border border-coffee-200"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-xl font-bold disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {isItemModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-coffee-800">
                                {editingItem
                                    ? "Edit Item"
                                    : "Add Modifier Item"}
                            </h2>
                            <button
                                onClick={() => setIsItemModalOpen(false)}
                                className="p-2 hover:bg-coffee-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleItemSubmit}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={itemForm.name}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-coffee-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                    Price (+Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.price}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            price: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border border-coffee-200"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="avail"
                                    checked={itemForm.is_available}
                                    onChange={(e) =>
                                        setItemForm({
                                            ...itemForm,
                                            is_available: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 text-coffee-600 rounded"
                                />
                                <label
                                    htmlFor="avail"
                                    className="ml-2 text-sm font-medium text-coffee-700"
                                >
                                    Available
                                </label>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsItemModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-xl font-bold disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModifiers;
