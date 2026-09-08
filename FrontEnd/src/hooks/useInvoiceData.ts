"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export const notify = (type: number, msg: string) => {
  console.log(type === 1 ? "Success:" : "Error:", msg);
};

// Fetch functions
const fetchProducts = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}products`);
  return res.json();
};

const fetchDrivers = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}driver`);
  return res.json();
};

const fetchCities = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}cities`);
  return res.json();
};

const fetchClients = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}clients`);
  return res.json();
};

const fetchServices = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}services`);
  return res.json();
};

export const useInvoiceData = (invoiceType: string, isUpdate: boolean = false) => {
  const router = useRouter();

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  // State
  const [date, setDate] = useState(dateString);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedCities, setSelectedCities] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);
  const [type, setType] = useState(invoiceType);
  const [status, setStatus] = useState("DRAFT");
  const [deliveryNotes, setDeliveryNotes] = useState<any[]>([]);
  const [shippingNoteInvoices, setShippingNoteInvoices] = useState<any[]>([]);
  const [selectedShippingNote, setSelectedShippingNote] = useState<any>(null);
  const [shippingNoteProducts, setShippingNoteProducts] = useState<any[]>([]);
  const [loadingDeliveryNotes, setLoadingDeliveryNotes] = useState(false);
  const [loadingShippingNotes, setLoadingShippingNotes] = useState(false);
  const [originalShippingNoteId, setOriginalShippingNoteId] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Refs to prevent unnecessary recalculations
  const prevItemsRef = useRef<string>("");
  const prevServicesRef = useRef<string>("");
  const isInitialMount = useRef(true);

  // Use React Query for master data with proper caching
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  // Calculate totals - use a ref to store the function
  const calculateTotals = useCallback(() => {
    let ht = 0;
    let vat = 0;
    let ttc = 0;

    // Use the current values from refs to avoid dependency issues
    const currentItems = invoiceItems;
    const currentServices = selectedServices;

    currentItems.forEach((item) => {
      const itemHT = (item.price || 0) * (item.quantity || 0);
      const itemVAT = itemHT * ((item.vatRate || 0) / 100);
      const itemTTC = itemHT + itemVAT;

      ht += itemHT;
      vat += itemVAT;
      ttc += itemTTC;
    });

    currentServices.forEach((service) => {
      const servicePrice = service.price || 0;
      const serviceVAT = servicePrice * 0.19;
      ht += servicePrice;
      vat += serviceVAT;
      ttc += servicePrice + serviceVAT;
    });

    setTotalHT(ht);
    setTotalVAT(vat);
    setTotalTTC(ttc);
  }, [invoiceItems, selectedServices]);

  // Auto-generate invoice number
  const autoGenerateNumber = useCallback(async () => {
    if (isUpdate) return;
    
    setGeneratingNumber(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}sale-invoices/generate-number/${type}`);
      const data = await response.json();
      if (data.nextInvoiceNumber) {
        setInvoiceNumber(data.nextInvoiceNumber);
        notify(1, "Numéro de facture généré automatiquement");
      } else {
        notify(2, "Erreur lors de la génération du numéro");
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
      notify(2, "Erreur lors de la génération du numéro");
    } finally {
      setGeneratingNumber(false);
    }
  }, [type, isUpdate]);

  // Auto-generate number only on mount
  useEffect(() => {
    if (!isUpdate && !invoiceNumber) {
      autoGenerateNumber();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals when items or services change - with proper comparison
  useEffect(() => {
    // Skip on initial mount to avoid double calculation
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const itemsKey = JSON.stringify(invoiceItems);
    const servicesKey = JSON.stringify(selectedServices);
    
    if (prevItemsRef.current !== itemsKey || prevServicesRef.current !== servicesKey) {
      prevItemsRef.current = itemsKey;
      prevServicesRef.current = servicesKey;
      calculateTotals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceItems, selectedServices]);

  // Service handlers
  const addService = useCallback((service: any) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(prev => [...prev, service]);
      notify(1, `Service "${service.name}" ajouté`);
      return true;
    }
    notify(2, "Service déjà sélectionné");
    return false;
  }, [selectedServices]);

  const removeService = useCallback((serviceId: number) => {
    const service = selectedServices.find(s => s.id === serviceId);
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    if (service) {
      notify(1, `Service "${service.name}" supprimé`);
    }
  }, [selectedServices]);

  const clearServices = useCallback(() => {
    setSelectedServices([]);
  }, []);

  const calculateServiceTotal = useCallback(() => {
    return selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  }, [selectedServices]);

  const getServiceIds = useCallback(() => {
    return selectedServices.map(s => s.id);
  }, [selectedServices]);

  const getServiceAmounts = useCallback(() => {
    const amounts: { [key: number]: number } = {};
    selectedServices.forEach((service) => {
      amounts[service.id] = service.price || 0;
    });
    return amounts;
  }, [selectedServices]);

  const loadServicesFromDeliveryNotes = useCallback((deliveryNotesData: any[]) => {
    const allServices: any[] = [];
    const serviceIds = new Set();
    
    deliveryNotesData.forEach((note: any) => {
      if (note.services && note.services.length > 0) {
        note.services.forEach((serviceItem: any) => {
          let service = serviceItem;
          if (serviceItem.service) {
            service = serviceItem.service;
          }
          if (service && service.id && !serviceIds.has(service.id)) {
            serviceIds.add(service.id);
            const serviceWithPrice = {
              ...service,
              price: service.price || serviceItem.price || 0
            };
            allServices.push(serviceWithPrice);
          }
        });
      }
    });
    
    if (allServices.length > 0) {
      setSelectedServices(allServices);
      notify(1, `${allServices.length} service(s) chargé(s) depuis les bons de livraison`);
    }
    
    return allServices;
  }, []);

  return {
    date, setDate,
    startDate, setStartDate,
    endDate, setEndDate,
    invoiceItems, setInvoiceItems,
    invoiceNumber, setInvoiceNumber,
    products,
    clients,
    drivers,
    cities,
    selectedCities, setSelectedCities,
    client, setClient,
    driver, setDriver,
    totalHT, setTotalHT,
    totalTTC, setTotalTTC,
    totalVAT, setTotalVAT,
    type, setType,
    status, setStatus,
    deliveryNotes, setDeliveryNotes,
    shippingNoteInvoices, setShippingNoteInvoices,
    selectedShippingNote, setSelectedShippingNote,
    shippingNoteProducts, setShippingNoteProducts,
    loadingDeliveryNotes, setLoadingDeliveryNotes,
    loadingShippingNotes, setLoadingShippingNotes,
    originalShippingNoteId, setOriginalShippingNoteId,
    invoice, setInvoice,
    autoGenerateNumber,
    generatingNumber,
    id: null,
    dispatch: null,
    navigate: router,
    calculateTotals,
    notify,
    services,
    selectedServices,
    setSelectedServices,
    loadingServices,
    addService,
    removeService,
    clearServices,
    calculateServiceTotal,
    getServiceIds,
    getServiceAmounts,
    loadServicesFromDeliveryNotes,
  };
};