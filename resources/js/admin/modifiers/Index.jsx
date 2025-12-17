import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers, Search, X } from "lucide-react";
import axios from "axios";
import submitToBlade from "../../global_components/BladeForm/submitToBlade";

const AdminModifiers = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Modifier Group Modal
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({
        name: "",
        type: "single",
        min_selection: 0,
        max_selection: 1,
        is_required: false,
    });

    // Modifier Item Modal
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [itemForm, setItemForm] = useState({
        name: "",
        price: 0,
        is_available: true,
    });

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        try {
            const params = { search };
            const response = await axios.get("/api/admin/menu-items", {
                params,
            });
            setProducts(response.data.menuItems.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    };

    const fetchProductDetails = async (id) => {
        try {
            const response = await axios.get(`/api/admin/menu-items/${id}`);
            setSelectedProduct(response.data);
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };

    // --- Modifier Group Handlers ---
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

    const handleGroupSubmit = (e) => {
        e.preventDefault();
        // NOTE: Modifier Group creation needs to be linked to a product?
        // Based on current DB schema/Controller, ModifierGroup seems independent or linked via pivot.
        // The controller `store` doesn't take product_id. It seems ModifierGroups are global or managed separately.
        // Assuming global for now as per controller logic.

        if (editingGroup) {
            submitToBlade(
                `/admin/modifier-groups/${editingGroup.id}`,
                "PUT",
                groupForm
            );
        } else {
            submitToBlade("/admin/modifier-groups", "POST", groupForm);
        }
    };

    const handleDeleteGroup = (id) => {
        if (
            confirm("Delete this modifier group? This action cannot be undone.")
        ) {
            submitToBlade(`/admin/modifier-groups/${id}`, "DELETE");
        }
    };

    // --- Modifier Item Handlers ---
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

    const handleItemSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            submitToBlade(
                `/admin/modifier-groups/${activeGroupId}/modifier-items/${editingItem.id}`,
                "PUT",
                itemForm
            );
        } else {
            submitToBlade(
                `/admin/modifier-groups/${activeGroupId}/modifier-items`,
                "POST",
                itemForm
            );
        }
    };

    const handleToggleItem = (groupId, itemId) => {
        submitToBlade(
            `/admin/modifier-groups/${groupId}/modifier-items/${itemId}/toggle-available`,
            "POST"
        );
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Modifier Management
                    </h1>
                    <p className="text-stone-500">
                        Manage modifier groups and items
                    </p>
                </div>
                <button
                    onClick={() => handleOpenGroupModal()}
                    className="w-full sm:w-auto bg-amber-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-amber-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Modifier Group</span>
                </button>
            </header>

            {/* Modifier Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-stone-800">
                                {editingGroup
                                    ? "Edit Group"
                                    : "Add Modifier Group"}
                            </h2>
                            <button
                                onClick={() => setIsGroupModalOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleGroupSubmit}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-white"
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
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <label
                                        htmlFor="req"
                                        className="ml-2 text-sm font-medium text-stone-700"
                                    >
                                        Required
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200"
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
                                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-xl font-bold"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modifier Item Modal */}
            {isItemModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-stone-800">
                                {editingItem
                                    ? "Edit Item"
                                    : "Add Modifier Item"}
                            </h2>
                            <button
                                onClick={() => setIsItemModalOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleItemSubmit}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200"
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
                                    className="w-4 h-4 text-amber-600 rounded"
                                />
                                <label
                                    htmlFor="avail"
                                    className="ml-2 text-sm font-medium text-stone-700"
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
                                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-xl font-bold"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-80 lg:h-[calc(100vh-200px)] flex flex-col">
                    <div className="p-4 border-b border-stone-100">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-stone-500">
                                Loading...
                            </div>
                        ) : (
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() =>
                                        fetchProductDetails(product.id)
                                    }
                                    className={`p-4 border-b border-stone-50 cursor-pointer hover:bg-amber-50 transition-colors ${
                                        selectedProduct?.id === product.id
                                            ? "bg-amber-50 border-l-4 border-l-amber-600"
                                            : ""
                                    }`}
                                >
                                    <div className="font-medium text-stone-800">
                                        {product.name}
                                    </div>
                                    <div className="text-xs text-stone-500">
                                        {product.category?.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Modifier Details */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedProduct ? (
                        <>
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                                    <Layers
                                        className="mr-2 text-amber-600"
                                        size={24}
                                    />
                                    Modifiers for: {selectedProduct.name}
                                </h2>

                                {selectedProduct.modifier_groups &&
                                selectedProduct.modifier_groups.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedProduct.modifier_groups.map(
                                            (group) => (
                                                <div
                                                    key={group.id}
                                                    className="border border-stone-200 rounded-xl overflow-hidden"
                                                >
                                                    <div className="bg-stone-50 p-4 flex justify-between items-center border-b border-stone-200">
                                                        <div>
                                                            <h3 className="font-bold text-stone-800">
                                                                {group.name}
                                                            </h3>
                                                            <div className="text-xs text-stone-500">
                                                                {group.type} •{" "}
                                                                {group.is_required
                                                                    ? "Required"
                                                                    : "Optional"}{" "}
                                                                • Min:{" "}
                                                                {
                                                                    group.min_selection
                                                                }{" "}
                                                                • Max:{" "}
                                                                {
                                                                    group.max_selection
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenGroupModal(
                                                                        group
                                                                    )
                                                                }
                                                                className="p-1.5 bg-white border border-stone-200 rounded hover:text-amber-600"
                                                            >
                                                                <Edit2
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteGroup(
                                                                        group.id
                                                                    )
                                                                }
                                                                className="p-1.5 bg-white border border-stone-200 rounded hover:text-red-600"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 className="text-sm font-bold text-stone-600">
                                                                Items
                                                            </h4>
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenItemModal(
                                                                        group.id
                                                                    )
                                                                }
                                                                className="text-xs font-bold text-amber-700 hover:underline"
                                                            >
                                                                + Add Item
                                                            </button>
                                                        </div>

                                                        {group.modifier_items &&
                                                        group.modifier_items
                                                            .length > 0 ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {group.modifier_items.map(
                                                                    (item) => (
                                                                        <div
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            className="flex justify-between items-center p-2 bg-stone-50 rounded border border-stone-100"
                                                                        >
                                                                            <div>
                                                                                <div className="font-medium text-sm">
                                                                                    {
                                                                                        item.name
                                                                                    }
                                                                                </div>
                                                                                <div className="text-xs text-stone-500">
                                                                                    +Rp{" "}
                                                                                    {parseInt(
                                                                                        item.price
                                                                                    ).toLocaleString()}
                                                                                    {!item.is_available && (
                                                                                        <span className="text-red-500 ml-1">
                                                                                            (Unavailable)
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex space-x-1">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleOpenItemModal(
                                                                                            group.id,
                                                                                            item
                                                                                        )
                                                                                    }
                                                                                    className="text-stone-400 hover:text-amber-600"
                                                                                >
                                                                                    <Edit2
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                    />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleToggleItem(
                                                                                            group.id,
                                                                                            item.id
                                                                                        )
                                                                                    }
                                                                                    className={`text-xs px-1 rounded border ${
                                                                                        item.is_available
                                                                                            ? "text-green-600 border-green-200"
                                                                                            : "text-red-600 border-red-200"
                                                                                    }`}
                                                                                >
                                                                                    {item.is_available
                                                                                        ? "ON"
                                                                                        : "OFF"}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-stone-400 italic">
                                                                No items in this
                                                                group.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                                        <Layers className="mx-auto h-12 w-12 text-stone-300 mb-2" />
                                        <p className="text-stone-500">
                                            No modifier groups assigned to this
                                            product.
                                        </p>
                                        <button
                                            onClick={() =>
                                                alert(
                                                    "Feature to assign existing group is coming soon. Please create groups globally first."
                                                )
                                            }
                                            className="mt-4 text-amber-700 font-bold text-sm hover:underline"
                                        >
                                            Assign Group
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-12 text-center h-full flex flex-col items-center justify-center">
                            <Layers className="h-16 w-16 text-stone-200 mb-4" />
                            <h3 className="text-xl font-bold text-stone-400">
                                Select a menu item
                            </h3>
                            <p className="text-stone-400">
                                Select a product from the list to view and
                                manage its modifiers.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminModifiers;
