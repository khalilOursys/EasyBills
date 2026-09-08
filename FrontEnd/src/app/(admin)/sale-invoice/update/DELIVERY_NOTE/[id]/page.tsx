"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import validator from "validator";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import * as Toast from "@radix-ui/react-toast";
import { useInvoiceData } from "@/hooks/useInvoiceData";

const updateDeliveryNote = async ({ id, data }: { id: string; data: any }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}sale-invoices/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update delivery note");
    }
    return response.json();
};

const fetchDeliveryNote = async (id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}sale-invoices/${id}`);
    if (!response.ok) throw new Error("Failed to fetch delivery note");
    return response.json();
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function UpdateDeliveryNotePage({ params }: PageProps) {
    const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);

    React.useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return <UpdateDeliveryNoteContent id={resolvedParams.id} />;
}

function UpdateDeliveryNoteContent({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMsg, setToastMsg] = React.useState("");
    const [toastType, setToastType] = React.useState<"success" | "error">("success");
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Refs for loading state management
    let loadPromise: Promise<void> | null = null;
    let hasLoaded = false;
    let currentClientId: any = null;

    const {
        date,
        setDate,
        invoiceItems,
        setInvoiceItems,
        invoiceNumber,
        setInvoiceNumber,
        products,
        clients,
        drivers,
        client,
        setClient,
        driver,
        setDriver,
        totalHT,
        setTotalHT,
        totalTTC,
        setTotalTTC,
        totalVAT,
        setTotalVAT,
        status,
        setStatus,
        selectedShippingNote,
        setSelectedShippingNote,
        shippingNoteProducts,
        setShippingNoteProducts,
        loadingShippingNotes,
        setLoadingShippingNotes,
        calculateTotals,
    } = useInvoiceData("DELIVERY_NOTE", true);

    // Get current user from localStorage
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setCurrentUser(user);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    // Filter drivers for commercial users using useMemo
    const filteredDrivers = useMemo(() => {
        if (currentUser && currentUser.role === "COMMERCIAL" && currentUser.cin) {
            return drivers.filter(
                (driver: any) => driver.cin === currentUser.cin
            );
        }
        return drivers;
    }, [currentUser?.role, currentUser?.cin, drivers]);

    // Fetch invoice data with the loading pattern
    useEffect(() => {
        // If already loaded, skip
        if (hasLoaded) return;

        // If there's already a loading promise, wait for it
        if (loadPromise) {
            loadPromise.then(() => {
                setIsLoading(false);
            });
            return;
        }

        // Create the loading promise
        loadPromise = (async () => {
            try {
                const data = await fetchDeliveryNote(id);

                setInvoiceNumber(data.invoiceNumber || "");
                setDate(data.date ? data.date.split("T")[0] : "");
                setStatus(data.status || "DRAFT");

                if (data.client) {
                    const clientData = {
                        value: data.client.id,
                        label: data.client.name,
                        client: data.client,
                    };
                    setClient(clientData);
                    currentClientId = data.client.id;
                }

                if (data.driver) {
                    setDriver({
                        value: data.driver.id,
                        label: `${data.driver.firstName} ${data.driver.lastName}`,
                        driver: data.driver,
                        cin: data.driver.cin,
                    });
                }

                // Load shipping note if exists
                if (data.shippingNoteId) {
                    setSelectedShippingNote({
                        value: data.shippingNoteId,
                        label: data.shippingNote?.invoiceNumber || `ID: ${data.shippingNoteId}`,
                    });

                    if (data.shippingNote?.items) {
                        const shippingProducts = data.shippingNote.items.map((item: any) => ({
                            productId: item.productId,
                            productName: item.product?.name || `Produit ${item.productId}`,
                            quantity: item.quantity,
                            price: item.price,
                            vatRate: item.vatRate,
                            vatAmount: item.vatAmount,
                            originalQuantity: item.quantity,
                            shippingNoteItemId: item.id,
                        }));
                        setShippingNoteProducts(shippingProducts);
                    }
                }

                // Load items with shipping note data
                if (data.items && data.items.length > 0) {
                    const formattedItems = data.items.map((item: any) => ({
                        id: item.id,
                        productId: item.productId,
                        productName: item.product?.name || `Produit ${item.productId}`,
                        quantity: item.quantity,
                        price: item.price,
                        vatRate: item.vatRate || 0,
                        vatAmount: item.vatAmount || 0,
                        totalHT: (item.price || 0) * (item.quantity || 0),
                        totalTTC: (item.price || 0) * (item.quantity || 0) * (1 + (item.vatRate || 0) / 100),
                        originalQuantity: item.shippingNoteItem?.quantity || null,
                        shippingNoteItemId: item.shippingNoteItemId || null,
                        shippingNoteId: item.shippingNoteId || null,
                    }));
                    setInvoiceItems(formattedItems);
                }

                hasLoaded = true;

            } catch (error) {
                console.error("Error fetching delivery note:", error);
                showToast("Erreur lors du chargement du bon de livraison", "error");
            } finally {
                setIsLoading(false);
                loadPromise = null;
            }
        })();

        // Wait for the promise
        loadPromise.then(() => {
            // Nothing to do here, the promise handles everything
        });

    }, [id]);

    // Auto-select driver when filtered drivers change (for commercial users)
    useEffect(() => {
        if (filteredDrivers.length === 1 && !driver) {
            const singleDriver = filteredDrivers[0];
            setDriver({
                value: singleDriver.id,
                label: `${singleDriver.firstName} ${singleDriver.lastName}`,
                driver: singleDriver,
                cin: singleDriver.cin,
            });
        }
    }, [filteredDrivers, driver]);

    // Recalculate totals when items change
    useEffect(() => {
        calculateTotals();
    }, [invoiceItems, calculateTotals]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setToastOpen(true);
    };

    const updateMutation = useMutation({
        mutationFn: updateDeliveryNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["saleInvoices"] });
            showToast("✅ Bon de livraison mis à jour avec succès", "success");
            setTimeout(() => router.push("/sale-invoice/list/DELIVERY_NOTE"), 1500);
        },
        onError: (error: Error) => {
            showToast(`❌ ${error.message || "Erreur lors de la mise à jour"}`, "error");
        },
    });

    const handleItemChange = (index: number, field: string, value: any, additionalData: any = {}) => {
        const newItems = invoiceItems.map((item: any, i: number) => {
            if (i === index) {
                let updatedItem = { ...item, [field]: value };

                if (field === "productId" && Object.keys(additionalData).length > 0) {
                    updatedItem = {
                        ...updatedItem,
                        price: additionalData.price || 0,
                        vatRate: additionalData.vatRate || 0,
                        originalQuantity: additionalData.originalQuantity || null,
                        quantity: 1,
                        shippingNoteItemId: additionalData.shippingNoteItemId || item.shippingNoteItemId || null,
                    };
                } else if (field === "productId" && Object.keys(additionalData).length === 0) {
                    const selectedProduct = products.find((p: any) => p.id === value);
                    if (selectedProduct) {
                        updatedItem.price = selectedProduct.salePrice || selectedProduct.price || 0;
                        updatedItem.vatRate = selectedProduct.vat || 0;
                    }
                }

                if (field === "quantity" && updatedItem.originalQuantity) {
                    if (value > updatedItem.originalQuantity) {
                        showToast(`La quantité ne peut pas dépasser ${updatedItem.originalQuantity}`, "error");
                        updatedItem.quantity = updatedItem.originalQuantity;
                    }
                }

                const itemHT = (updatedItem.price || 0) * (updatedItem.quantity || 0);
                const itemVAT = itemHT * ((updatedItem.vatRate || 0) / 100);
                updatedItem.totalHT = itemHT;
                updatedItem.vatAmount = itemVAT;
                updatedItem.totalTTC = itemHT + itemVAT;

                return updatedItem;
            }
            return item;
        });

        setInvoiceItems(newItems);
    };

    const handleAddItem = () => {
        setInvoiceItems([
            ...invoiceItems,
            {
                productId: "",
                quantity: 1,
                price: 0,
                vatRate: 0,
                vatAmount: 0,
                totalHT: 0,
                totalTTC: 0,
                originalQuantity: null,
                shippingNoteItemId: null,
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = invoiceItems.filter((_: any, i: number) => i !== index);
        setInvoiceItems(newItems);
    };

    const getProductOptions = () => {
        if (selectedShippingNote && shippingNoteProducts.length > 0) {
            return shippingNoteProducts
                .filter((p: any) => p.quantity > 0)
                .map((p: any) => ({
                    label: `${p.productName} (Dispo: ${p.quantity})`,
                    value: p.productId,
                    originalQuantity: p.quantity,
                    price: p.price,
                    vatRate: p.vatRate,
                    shippingNoteItemId: p.shippingNoteItemId,
                }));
        } else {
            return products.map((product: any) => ({
                label: product.name,
                value: product.id,
                price: product.salePrice || product.price || 0,
                vatRate: product.vat || 0,
            }));
        }
    };

    const shouldShowOriginalQuantity = () => {
        return selectedShippingNote && shippingNoteProducts.length > 0;
    };

    const submitForm = async (event: React.FormEvent) => {
        event.preventDefault();

        if (validator.isEmpty(invoiceNumber)) {
            showToast("Numéro de facture est obligatoire", "error");
            return;
        }

        if (!client) {
            showToast("Client est obligatoire", "error");
            return;
        }

        if (invoiceItems.length === 0) {
            showToast("Au moins un article est obligatoire", "error");
            return;
        }

        for (let i = 0; i < invoiceItems.length; i++) {
            if (!invoiceItems[i].productId) {
                showToast(`L'article ${i + 1} doit avoir un produit sélectionné`, "error");
                return;
            }

            if (invoiceItems[i].originalQuantity && invoiceItems[i].quantity > invoiceItems[i].originalQuantity) {
                showToast(`La quantité de l'article ${i + 1} ne peut pas dépasser ${invoiceItems[i].originalQuantity}`, "error");
                return;
            }
        }

        const items = invoiceItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            shippingNoteItemId: item.shippingNoteItemId || null,
        }));

        const invoiceData: any = {
            invoiceNumber,
            date,
            type: "DELIVERY_NOTE",
            status,
            items,
            totalHT,
            totalTTC,
            clientId: client.value,
        };

        if (driver) {
            invoiceData.driverId = driver.value;
        }

        if (selectedShippingNote) {
            invoiceData.shippingNoteId = selectedShippingNote.value;
        }

        updateMutation.mutate({ id, data: invoiceData });
    };

    const statusOptions = [
        { value: "DRAFT", label: "Brouillon" },
        { value: "VALIDATED", label: "Validée" },
        { value: "PAID", label: "Payée" },
        { value: "CANCELLED", label: "Annulée" },
    ];

    const driverOptions = (
        currentUser?.role === "COMMERCIAL" ? filteredDrivers : drivers
    ).map((driver: any) => ({
        label: `${driver.firstName} ${driver.lastName} ${driver.phone ? `(${driver.phone})` : ""} ${driver.cin ? `- CIN: ${driver.cin}` : ""}`,
        value: driver.id,
        driver: driver,
        cin: driver.cin,
    }));

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <Toast.Provider>
            <div className="p-6">
                <PageBreadcrumb pageTitle="Modifier bon de livraison" />

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.push("/sale-invoice/list/DELIVERY_NOTE")}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        ← Retour à la liste
                    </button>
                </div>

                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="text-xl font-semibold text-black dark:text-white">
                            Modifier bon de livraison
                            {currentUser?.role === "COMMERCIAL" && (
                                <span className="ml-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                    Commercial: {currentUser.cin}
                                </span>
                            )}
                        </h3>
                    </div>

                    <form onSubmit={submitForm}>
                        <div className="p-6.5">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Numéro de facture <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        placeholder="Ex: BL-2023-001"
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Type de facture <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value="Bon de livraison"
                                        readOnly
                                        disabled
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5 py-3 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Statut
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Client <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        instanceId="client-select"
                                        placeholder="Sélectionner un client"
                                        value={client}
                                        options={clients.map((client: any) => ({
                                            label: client.name,
                                            value: client.id,
                                            client: client,
                                        }))}
                                        onChange={(e) => setClient(e)}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Chauffeur (optionnel)
                                    </label>
                                    {currentUser?.role === "COMMERCIAL" ? (
                                        <input
                                            type="text"
                                            value={
                                                driver
                                                    ? `${driver.driver?.firstName} ${driver.driver?.lastName}`
                                                    : "Aucun chauffeur sélectionné"
                                            }
                                            readOnly
                                            disabled
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5 py-3 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        />
                                    ) : (
                                        <Select
                                            instanceId="driver-select"
                                            placeholder="Sélectionner un chauffeur"
                                            value={driver}
                                            options={driverOptions}
                                            onChange={(e) => setDriver(e)}
                                            isClearable
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                    <small className="text-muted mt-1 block text-sm text-gray-500 dark:text-gray-400">
                                        {currentUser?.role === "COMMERCIAL"
                                            ? "Chauffeur automatiquement associé à votre compte commercial"
                                            : "Sélectionnez pour lier à une facture bon sortie"}
                                    </small>
                                </div>
                            </div>

                            {selectedShippingNote && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                        <span>✓</span>
                                        <span className="font-medium">
                                            Facture bon sortie associée : <strong>{selectedShippingNote.label}</strong>
                                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                (ID: {selectedShippingNote.value})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Ajouter un article
                                    </button>
                                    {selectedShippingNote && (
                                        <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Données chargées depuis: {selectedShippingNote.label}
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-800">
                                                <th className="border-b p-4 text-left">Produit</th>
                                                <th className="border-b p-4 text-left">Quantité</th>
                                                {shouldShowOriginalQuantity() && (
                                                    <th className="border-b p-4 text-left">Qté originale</th>
                                                )}
                                                <th className="border-b p-4 text-left">Prix unitaire (TND)</th>
                                                <th className="border-b p-4 text-left">TVA %</th>
                                                <th className="border-b p-4 text-right">Montant TVA</th>
                                                <th className="border-b p-4 text-right">Total HT</th>
                                                <th className="border-b p-4 text-right">Total TTC</th>
                                                <th className="border-b p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceItems.map((item: any, index: number) => (
                                                <tr key={index} className="border-b dark:border-strokedark">
                                                    <td className="p-4">
                                                        <select
                                                            value={item.productId || 0}
                                                            onChange={(e) => {
                                                                const selectedValue = Number(e.target.value);
                                                                const selectedOption = getProductOptions().find(
                                                                    (opt: any) => opt.value === selectedValue
                                                                );

                                                                if (selectedOption) {
                                                                    handleItemChange(
                                                                        index,
                                                                        "productId",
                                                                        selectedValue,
                                                                        {
                                                                            price: selectedOption.price || 0,
                                                                            vatRate: selectedOption.vatRate || 0,
                                                                            originalQuantity: selectedOption.originalQuantity || null,
                                                                            shippingNoteItemId: selectedOption.shippingNoteItemId || null,
                                                                        }
                                                                    );
                                                                } else {
                                                                    handleItemChange(index, "productId", selectedValue, {});
                                                                }
                                                            }}
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        >
                                                            <option value={0}>Sélectionner un produit</option>
                                                            {getProductOptions().map((option: any) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.originalQuantity || undefined}
                                                            value={item.quantity || 0}
                                                            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                                        />
                                                    </td>
                                                    {shouldShowOriginalQuantity() && (
                                                        <td className="p-4 text-center align-middle">
                                                            {item.originalQuantity ? (
                                                                <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                                    {item.originalQuantity}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs dark:bg-gray-600">-</span>
                                                            )}
                                                            {item.shippingNoteItemId && (
                                                                <small className="block text-xs text-gray-500 dark:text-gray-400">
                                                                    ID: {item.shippingNoteItemId}
                                                                </small>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.price || 0}
                                                            onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                                                            readOnly={!!selectedShippingNote}
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input disabled:bg-gray-100 dark:disabled:bg-gray-700"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.vatRate}
                                                            readOnly
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-50 px-3 py-2 outline-none dark:border-form-strokedark dark:bg-gray-700"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {(item.vatAmount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {(item.totalHT || 0).toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {(item.totalTTC || 0).toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="md:col-start-2">
                                    <label className="mb-3 block text-sm font-medium">Total HT (TND)</label>
                                    <input
                                        type="text"
                                        value={(totalHT || 0).toFixed(2)}
                                        readOnly
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5 py-3 outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="mb-3 block text-sm font-medium">Total TVA (TND)</label>
                                    <input
                                        type="text"
                                        value={(totalVAT || 0).toFixed(2)}
                                        readOnly
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5 py-3 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="md:col-start-3">
                                    <label className="mb-3 block text-sm font-medium">Total TTC (TND)</label>
                                    <input
                                        type="text"
                                        value={(totalTTC || 0).toFixed(2)}
                                        readOnly
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5 py-3 outline-none font-bold text-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <span>📦</span>
                                    <span className="font-medium">
                                        Bon de livraison - Client requis, chauffeur et bon sortie facultatifs
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push("/sale-invoice/list/DELIVERY_NOTE")}
                                    className="rounded-md border border-stroke px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Mise à jour...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            Mettre à jour
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <Toast.Root
                    open={toastOpen}
                    onOpenChange={setToastOpen}
                    className={`fixed top-20 right-4 w-80 rounded-md p-4 shadow-lg z-50 ${toastType === "success"
                        ? "bg-green-600 dark:bg-green-700 text-white"
                        : "bg-red-600 dark:bg-red-700 text-white"
                        }`}
                    duration={3000}
                >
                    <Toast.Title className="font-medium">{toastMsg}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="fixed top-4 right-4 z-50 outline-none" />
            </div>
        </Toast.Provider>
    );
}