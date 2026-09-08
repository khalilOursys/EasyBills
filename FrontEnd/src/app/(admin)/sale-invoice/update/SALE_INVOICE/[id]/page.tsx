"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import validator from "validator";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import * as Toast from "@radix-ui/react-toast";
import { useInvoiceData } from "@/hooks/useInvoiceData";

// Update sale invoice
const updateSaleInvoice = async ({ id, data }: { id: string; data: any }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}sale-invoices/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update sale invoice");
    }
    return response.json();
};

// Fetch single invoice by ID
const fetchSaleInvoice = async (id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}sale-invoices/${id}`);
    if (!response.ok) throw new Error("Failed to fetch invoice");
    return response.json();
};

// Module-level variables to prevent duplicate API calls across mounts
let loadPromise: Promise<void> | null = null;
let hasLoaded = false;
let deliveryNotesFetched = false;
let currentClientId: number | null = null;
let isFetchingDeliveryNotes = false;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function UpdateSaleInvoicePage({ params }: PageProps) {
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

    return <UpdateSaleInvoiceContent id={resolvedParams.id} />;
}

function UpdateSaleInvoiceContent({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMsg, setToastMsg] = React.useState("");
    const [toastType, setToastType] = React.useState<"success" | "error">("success");
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedDeliveryNotes, setSelectedDeliveryNotes] = React.useState<any[]>([]);
    const [loadingConsolidation, setLoadingConsolidation] = React.useState(false);

    const {
        date,
        setDate,
        invoiceItems,
        setInvoiceItems,
        invoiceNumber,
        setInvoiceNumber,
        products,
        clients,
        client,
        setClient,
        totalHT,
        totalTTC,
        totalVAT,
        status,
        setStatus,
        deliveryNotes,
        setDeliveryNotes,
        loadingDeliveryNotes,
        setLoadingDeliveryNotes,
        calculateTotals,
    } = useInvoiceData("SALE_INVOICE", true);

    // Fetch delivery notes for client - with module-level lock
    const fetchDeliveryNotesForClient = async (clientId: number) => {
        // Skip if already fetched for this client
        if (deliveryNotesFetched && currentClientId === clientId) {
            return;
        }

        // Skip if currently fetching
        if (isFetchingDeliveryNotes) {
            return;
        }

        isFetchingDeliveryNotes = true;
        setLoadingDeliveryNotes(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}sale-invoices?type=DELIVERY_NOTE&status=VALIDATED`
            );
            const data = await response.json();
            const filteredInvoices = (data || []).filter(
                (inv: any) => inv.client.id === clientId
            );
            setDeliveryNotes(filteredInvoices);
            deliveryNotesFetched = true;
            currentClientId = clientId;
        } catch (error) {
            console.error("Error fetching delivery notes:", error);
        } finally {
            setLoadingDeliveryNotes(false);
            isFetchingDeliveryNotes = false;
        }
    };

    // Fetch invoice data - using module-level Promise lock
    useEffect(() => {
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
                const data = await fetchSaleInvoice(id);

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

                if (data.items && data.items.length > 0) {
                    const formattedItems = data.items.map((item: any) => ({
                        id: item.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        vatRate: item.vatRate || 0,
                        vatAmount: item.vatAmount || 0,
                        totalHT: (item.price || 0) * (item.quantity || 0),
                        totalTTC: (item.price || 0) * (item.quantity || 0) * (1 + (item.vatRate || 0) / 100),
                    }));
                    setInvoiceItems(formattedItems);
                }

                if (data.consolidatedDeliveryNotes && data.consolidatedDeliveryNotes.length > 0) {
                    const selected = data.consolidatedDeliveryNotes.map((c: any) => ({
                        value: c.sourceDeliveryNote.id,
                        label: `${c.sourceDeliveryNote.invoiceNumber} - ${new Date(c.sourceDeliveryNote.date).toLocaleDateString()}`,
                    }));
                    setSelectedDeliveryNotes(selected);
                }

                // Fetch delivery notes for this client
                if (data.client) {
                    await fetchDeliveryNotesForClient(data.client.id);
                }

                hasLoaded = true;

            } catch (error) {
                console.error("Error fetching invoice:", error);
                showToast("Erreur lors du chargement de la facture", "error");
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

    // Fetch delivery notes when client changes - but ONLY if different client
    useEffect(() => {
        // Skip if still loading initial data
        if (isLoading || !client?.value) return;
        // Skip if we haven't finished initial load
        if (!hasLoaded) return;
        // Skip if this is the same client
        if (client.value === currentClientId) return;

        // Update current client and fetch
        currentClientId = client.value;
        deliveryNotesFetched = false;
        fetchDeliveryNotesForClient(client.value);
    }, [client]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setToastOpen(true);
    };

    const updateMutation = useMutation({
        mutationFn: updateSaleInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["saleInvoices"] });
            queryClient.invalidateQueries({ queryKey: ["saleInvoice", id] });
            showToast("✅ Facture de vente mise à jour avec succès", "success");
            setTimeout(() => router.push("/sale-invoice/list/SALE_INVOICE"), 1500);
        },
        onError: (error: Error) => {
            showToast(`❌ ${error.message || "Erreur lors de la mise à jour"}`, "error");
        },
    });

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = invoiceItems.map((item: any, i: number) => {
            if (i === index) {
                let updatedItem = { ...item, [field]: value };

                if (field === "productId") {
                    const selectedProduct = products.find((p: any) => p.id === value);
                    if (selectedProduct) {
                        updatedItem.price = selectedProduct.salePrice || selectedProduct.price || 0;
                        updatedItem.vatRate = selectedProduct.vat || 0;
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
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = invoiceItems.filter((_: any, i: number) => i !== index);
        setInvoiceItems(newItems);
    };

    const handleDeliveryNoteSelect = (selectedOptions: any) => {
        setSelectedDeliveryNotes(selectedOptions || []);
    };

    const handleClearSelection = () => {
        setSelectedDeliveryNotes([]);
    };

    const loadSelectedDeliveryNotes = async () => {
        if (selectedDeliveryNotes.length === 0) {
            showToast("Veuillez sélectionner au moins un bon de livraison", "error");
            return;
        }

        if (
            !window.confirm(
                `Voulez-vous charger les données de ${selectedDeliveryNotes.length} bon(s) de livraison ?`
            )
        ) {
            return;
        }

        setLoadingConsolidation(true);

        try {
            const selectedNotesData = deliveryNotes.filter((note: any) =>
                selectedDeliveryNotes.some((selected: any) => selected.value === note.id)
            );

            const combinedItems: any[] = [];
            selectedNotesData.forEach((note: any) => {
                note.items.forEach((item: any) => {
                    combinedItems.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        vatRate: item.vatRate,
                        vatAmount: item.vatAmount,
                        totalHT: (item.price || 0) * (item.quantity || 0),
                        totalTTC: (item.price || 0) * (item.quantity || 0) * (1 + (item.vatRate || 0) / 100),
                    });
                });
            });

            setInvoiceItems(combinedItems);
            showToast("Données chargées avec succès", "success");
        } catch (error) {
            console.error("Error loading delivery notes:", error);
            showToast("Erreur lors du chargement des données", "error");
        } finally {
            setLoadingConsolidation(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: any = {
            DRAFT: { bg: "bg-gray-500", text: "Brouillon" },
            VALIDATED: { bg: "bg-green-500", text: "Validée" },
            PAID: { bg: "bg-blue-500", text: "Payée" },
            CANCELLED: { bg: "bg-red-500", text: "Annulée" },
        };
        const config = statusConfig[status] || { bg: "bg-gray-500", text: status };
        return (
            <span className={`inline-block rounded-full ${config.bg} px-3 py-1 text-xs text-white`}>
                {config.text}
            </span>
        );
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
        }

        const items = invoiceItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
        }));

        const invoiceData = {
            invoiceNumber,
            date,
            type: "SALE_INVOICE",
            status,
            items,
            totalHT,
            totalTTC,
            clientId: client.value,
            deliveryNoteIds: selectedDeliveryNotes.map((note: any) => note.value),
        };

        updateMutation.mutate({ id, data: invoiceData });
    };

    const statusOptions = [
        { value: "DRAFT", label: "Brouillon" },
        { value: "VALIDATED", label: "Validée" },
        { value: "PAID", label: "Payée" },
        { value: "CANCELLED", label: "Annulée" },
    ];

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
                <PageBreadcrumb pageTitle="Modifier facture de vente" />

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.push("/sale-invoice/list/SALE_INVOICE")}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        ← Retour à la liste
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            Facture #{invoiceNumber}
                        </span>
                        {getStatusBadge(status)}
                    </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="text-xl font-semibold text-black dark:text-white">
                            Modifier facture de vente
                        </h3>
                    </div>

                    <form onSubmit={submitForm}>
                        <div className="p-6.5">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Numéro de facture <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        placeholder="Ex: FAC-2023-001"
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
                                        value="Facture vente"
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

                                <div className="md:col-span-2">
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
                                        onChange={(e) => {
                                            setClient(e);
                                            setSelectedDeliveryNotes([]);
                                            // Reset delivery notes fetched flag for new client
                                            deliveryNotesFetched = false;
                                            currentClientId = e?.value || null;
                                        }}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>

                            {/* Delivery Notes Section */}
                            {client?.value && (
                                <>
                                    <div className="mt-6">
                                        <div className="border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                            <div className="border-b border-blue-200 bg-blue-600 px-4 py-3 rounded-t-lg dark:border-blue-800">
                                                <h6 className="text-white font-medium flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    Consolidation de bons de livraison
                                                    {loadingDeliveryNotes && (
                                                        <span className="ml-2">
                                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </h6>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                                                    <div className="flex-1 w-full md:w-auto min-w-0">
                                                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                                            Sélectionner les bons de livraison à consolider
                                                        </label>
                                                        <div className="w-full">
                                                            <Select
                                                                isMulti
                                                                instanceId="delivery-notes-select"
                                                                placeholder="Choisir un ou plusieurs bons de livraison..."
                                                                value={selectedDeliveryNotes}
                                                                options={deliveryNotes.map((note: any) => ({
                                                                    value: note.id,
                                                                    label: `${note.invoiceNumber} - ${new Date(note.date).toLocaleDateString()} - ${note.totalTTC?.toFixed(2)} TND`,
                                                                })) as any}
                                                                onChange={handleDeliveryNoteSelect}
                                                                isDisabled={loadingDeliveryNotes}
                                                                isLoading={loadingDeliveryNotes}
                                                                closeMenuOnSelect={false}
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                styles={{
                                                                    control: (base) => ({
                                                                        ...base,
                                                                        minHeight: '42px',
                                                                    }),
                                                                    valueContainer: (base) => ({
                                                                        ...base,
                                                                        padding: '2px 8px',
                                                                    }),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={loadSelectedDeliveryNotes}
                                                            disabled={
                                                                selectedDeliveryNotes.length === 0 ||
                                                                loadingConsolidation
                                                            }
                                                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap h-[42px]"
                                                        >
                                                            {loadingConsolidation ? (
                                                                <>
                                                                    <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                    </svg>
                                                                    <span>Chargement...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    <span>Charger la sélection</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        {selectedDeliveryNotes.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={handleClearSelection}
                                                                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 transition-colors flex-shrink-0 h-[42px] w-[42px] flex items-center justify-center"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="border border-stroke rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-strokedark">
                                            <div className="border-b border-stroke px-4 py-3 dark:border-strokedark">
                                                <h6 className="font-medium flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Bons de livraison disponibles
                                                    <span className="ml-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                        {deliveryNotes.length}
                                                    </span>
                                                </h6>
                                            </div>
                                            <div className="p-4 max-h-[250px] overflow-y-auto">
                                                {deliveryNotes.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full table-auto">
                                                            <thead>
                                                                <tr className="bg-gray-100 dark:bg-gray-700">
                                                                    <th className="border-b p-3 text-left text-xs">N° Bon</th>
                                                                    <th className="border-b p-3 text-left text-xs">Date</th>
                                                                    <th className="border-b p-3 text-right text-xs">Total TTC</th>
                                                                    <th className="border-b p-3 text-left text-xs">Statut</th>
                                                                    <th className="border-b p-3 text-center text-xs">Articles</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {deliveryNotes.map((note: any) => (
                                                                    <tr key={note.id} className="border-b dark:border-strokedark">
                                                                        <td className="p-3 text-sm">{note.invoiceNumber}</td>
                                                                        <td className="p-3 text-sm">
                                                                            {new Date(note.date).toLocaleDateString()}
                                                                        </td>
                                                                        <td className="p-3 text-sm text-right">
                                                                            {note.totalTTC?.toFixed(2)} TND
                                                                        </td>
                                                                        <td className="p-3 text-sm">{getStatusBadge(note.status)}</td>
                                                                        <td className="p-3 text-center">
                                                                            <span className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs dark:bg-gray-600">
                                                                                {note.items?.length || 0}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                                        Aucun bon de livraison trouvé
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
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
                                    {selectedDeliveryNotes.length > 0 && (
                                        <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            Données consolidées de {selectedDeliveryNotes.length} bon(s)
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-800">
                                                <th className="border-b p-4 text-left">Produit</th>
                                                <th className="border-b p-4 text-left">Quantité</th>
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
                                                            value={item.productId}
                                                            onChange={(e) => handleItemChange(index, "productId", Number(e.target.value))}
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                        >
                                                            <option value={0}>Sélectionner un produit</option>
                                                            {products.map((product: any) => (
                                                                <option key={product.id} value={product.id}>
                                                                    {product.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
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
                                <div className="md:col-start-3">
                                    <label className="mb-3 block text-sm font-medium">Total HT (TND)</label>
                                    <input
                                        type="text"
                                        value={(totalHT || 0).toFixed(2)}
                                        readOnly
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-gray-100 px-5 py-3 outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="md:col-start-3">
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
                                    <span>📄</span>
                                    <span className="font-medium">
                                        Modification de facture de vente - Modifiez les champs nécessaires
                                    </span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push("/sale-invoice/list/SALE_INVOICE")}
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