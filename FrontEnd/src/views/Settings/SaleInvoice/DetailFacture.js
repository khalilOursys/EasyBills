import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../assets/img/logo.png";
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Table,
  Badge,
} from "react-bootstrap";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSaleInvoice } from "../../../Redux/saleInvoiceSlice";
import { fetchProducts } from "../../../Redux/productsSlice";
import { fetchClients } from "../../../Redux/clientsSlice";

function SaleInvoiceDetails() {
  const dispatch = useDispatch();
  const navigate = useHistory();
  const { id } = useParams();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [client, setClient] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);
  const [clientDetails, setClientDetails] = useState({});
  const [companyInfo, setCompanyInfo] = useState({
    name: "MedicaCom",
    address: "123 Rue du Commerce",
    city: "75000 Paris, France",
    phone: "01 23 45 67 89",
    email: "contact@medicacom.fr",
    siret: "123 456 789 00012",
    vatNumber: "FR12 123456789",
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      const [clientsRes, productsRes] = await Promise.all([
        dispatch(fetchClients()),
        dispatch(fetchProducts()),
      ]);

      setClients(clientsRes.payload || []);
      setProducts(productsRes.payload || []);

      const invoiceRes = await dispatch(getSaleInvoice(id));
      const data = invoiceRes.payload;

      setInvoiceNumber(data.invoiceNumber);
      setDate(data.date?.split("T")[0] || "");
      setType(data.type);
      setStatus(data.status);
      setTotalHT(data.totalHT || 0);
      setTotalTTC(data.totalTTC || 0);
      setTotalVAT((data.totalTTC || 0) - (data.totalHT || 0));

      // Store client details for PDF
      setClientDetails(data.client || {});

      setClient({
        label: data.client?.name || "",
        value: data.client?.id,
        client: data.client,
      });

      // Map invoice items with VAT calculation and add rem (discount) as 0 for now
      setInvoiceItems(
        (data.items || []).map((item) => {
          const product =
            productsRes.payload?.find((p) => p.id === item.productId) || {};
          const rem = item.discount || 0; // Use discount if available in data
          const itemHT = item.price * item.quantity * (1 - rem / 100);
          const itemVAT = item.vatRate ? itemHT * (item.vatRate / 100) : 0;
          const vatRate = item.vatRate || (data.type === "QUOTATION" ? 0 : 19);

          return {
            productId: item.productId,
            productName: product?.name || "Produit inconnu",
            quantity: item.quantity,
            price: item.price,
            rem: rem,
            vatRate: vatRate,
            vatAmount: item.vatAmount || itemVAT,
            totalHT: itemHT,
            totalTTC: itemHT + itemVAT,
          };
        }),
      );
    };

    loadData();
  }, [dispatch, id]);

  /* ================== NUMBER TO FRENCH WORDS ================== */
  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];

  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt",
  ];

  const below100 = (n) => {
    if (n === 0) return "";
    if (n < 20) return units[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    let str = tens[ten];
    if (ten === 7 || ten === 9) {
      const teen = 10 + unit;
      if (unit === 0) return str + "-dix";
      let connector = "-";
      if (ten === 7 && unit === 1) connector = "-et-";
      return str + connector + units[teen];
    } else if (ten === 8) {
      if (unit === 0) return "quatre-vingts";
      return str + "-" + units[unit];
    } else {
      if (unit === 0) return str;
      let connector = "-";
      if (unit === 1 && ten > 1) connector = "-et-";
      return str + connector + units[unit];
    }
  };

  const below1000 = (n) => {
    if (n === 0) return "";
    if (n < 100) return below100(n);
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (hundred === 1) str = "cent";
    else if (hundred > 1)
      str = units[hundred] + " cent" + (rest === 0 ? "s" : "");
    if (rest > 0) str += (hundred > 0 ? " " : "") + below100(rest);
    return str;
  };

  const numberToFrenchWords = (n) => {
    if (n === 0) return "zéro";
    if (n < 1000) return below1000(n);
    const thousand = Math.floor(n / 1000);
    const rest = n % 1000;
    let str = "";
    if (thousand === 1) str = "mille";
    else str = below1000(thousand) + " mille" + (rest === 0 ? "s" : "");
    if (rest > 0) str += " " + below1000(rest);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  /* ================== NUMBER FORMATTING ================== */
  const formatNumber = (num) => {
    return num.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getTypeLabel = (type) => {
    const labels = {
      QUOTATION: "Devis",
      INVOICE: "Facture",
      DELIVERY_NOTE: "Bon de livraison",
      SALE_REFUND: "Avoir",
    };
    return labels[type] || type;
  };

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const margin = 15; // Increased for cleaner look
    const blue = [0, 102, 204]; // Softer blue for modern feel
    const gray = [128, 128, 128]; // For lines and accents

    // Helper function to load image properly
    const addLogoToPDF = (x, y) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = logo;
        img.onload = () => {
          try {
            doc.addImage(img, "PNG", x, y, 30, 15); // Smaller, modern size
          } catch (e) {
            console.warn("Could not add logo:", e);
          }
          resolve();
        };
        img.onerror = () => {
          console.warn("Logo failed to load");
          resolve();
        };
      });
    };

    const addHeader = async (isFirstPage = true) => {
      if (isFirstPage) await addLogoToPDF(margin, 10);

      doc.setFillColor(245, 245, 245); // Light gray background for header
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setFontSize(16);
      doc.setTextColor(...blue);
      doc.setFont("helvetica", "bold");
      doc.text(getTypeLabel(type).toUpperCase(), pageWidth / 2, 20, {
        align: "center",
      });

      // Company name and MF
      doc.setFontSize(10);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(companyInfo.name, margin + 35, 18);
      doc.text(`MF: ${companyInfo.vatNumber}`, pageWidth - margin, 18, {
        align: "right",
      });
    };

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber} / ${pageCount}`,
        pageWidth / 2,
        290,
        { align: "center" },
      );
      doc.text(
        `Tél: ${companyInfo.phone} | Email: ${companyInfo.email}`,
        pageWidth / 2,
        295,
        { align: "center" },
      );
    };

    const generatePDF = async () => {
      await addHeader(true);

      // Invoice details
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Numéro: ${invoiceNumber}`, margin, 40);
      const formattedDate = date.split("-").reverse().join("/");
      doc.text(`Date: ${formattedDate}`, margin + 60, 40);
      doc.text(`Client: ${clientDetails.name || ""}`, margin, 45);

      // Client info section
      doc.setFontSize(9);
      doc.text(
        `Adresse: ${clientDetails.address || ""}, ${clientDetails.city || ""}`,
        margin,
        50,
      );
      doc.text(`Téléphone: ${clientDetails.phone || ""}`, margin, 55);
      doc.text(`Email: ${clientDetails.email || ""}`, margin, 60);

      // Line separator
      doc.setDrawColor(...gray);
      doc.line(margin, 65, pageWidth - margin, 65);

      // Items Table
      const tableHeaders = [
        ["Désignation", "Rem %", "Qte", "P.U HT", "TVA %", "P.HT", "P.TTC"],
      ];

      const tableBody = invoiceItems.map((item) => [
        item.productName,
        formatNumber(item.rem),
        formatNumber(item.quantity),
        formatNumber(item.price),
        formatNumber(item.vatRate),
        formatNumber(item.totalHT),
        formatNumber(item.totalTTC),
      ]);

      let finalY = 70;
      autoTable(doc, {
        startY: finalY,
        head: tableHeaders,
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: gray,
          lineWidth: 0.1,
          textColor: 50,
          overflow: "linebreak",
          minCellHeight: 5,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: "auto", halign: "left" },
          1: { cellWidth: 15, halign: "right" },
          2: { cellWidth: 15, halign: "right" },
          3: { cellWidth: 25, halign: "right" },
          4: { cellWidth: 15, halign: "right" },
          5: { cellWidth: 25, halign: "right" },
          6: { cellWidth: 25, halign: "right" },
        },
        didDrawPage: (data) => {
          addHeader(false); // Add header on new pages
          addFooter(); // Add footer on every page
          finalY = data.settings.startY;
        },
      });

      finalY = doc.lastAutoTable.finalY + 10;

      // VAT Summary Table
      const vatSummary = {};
      invoiceItems.forEach((item) => {
        const rate = item.vatRate;
        const base = item.totalHT;
        const montant = item.vatAmount;
        if (!vatSummary[rate]) vatSummary[rate] = { base: 0, montant: 0 };
        vatSummary[rate].base += base;
        vatSummary[rate].montant += montant;
      });

      const taxRates = [0, 7, 13, 19];
      const taxBody = taxRates.map((rate) => {
        const s = vatSummary[rate] || { base: 0, montant: 0 };
        return [rate + "%", formatNumber(s.base), formatNumber(s.montant)];
      });

      autoTable(doc, {
        startY: finalY,
        head: [["Taxe", "Base", "Montant"]],
        body: taxBody,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: gray,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          halign: "center",
        },
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "right" },
          2: { halign: "right" },
        },
        margin: { left: margin, right: pageWidth / 2 },
        tableWidth: "auto",
        didDrawPage: addFooter,
      });

      // Totals
      finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total HT: ${formatNumber(totalHT)} DT`,
        pageWidth - margin,
        finalY,
        { align: "right" },
      );
      doc.text(
        `TVA: ${formatNumber(totalVAT)} DT`,
        pageWidth - margin,
        finalY + 5,
        { align: "right" },
      );
      doc.text(
        `Total TTC: ${formatNumber(totalTTC)} DT`,
        pageWidth - margin,
        finalY + 10,
        { align: "right" },
      );

      // Amount in words
      finalY += 20;
      const totalStr = totalTTC.toFixed(3);
      const [integerPart, decimalPart] = totalStr.split(".");
      const millimes = parseInt(decimalPart, 10);
      const amountWords = `Arrêté le présent devis à la somme de : ${numberToFrenchWords(parseInt(integerPart, 10))} Dinars et ${numberToFrenchWords(millimes)} Millimes`;
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(amountWords, margin, finalY, {
        maxWidth: pageWidth - 2 * margin,
      });

      // Validity note
      finalY += 15;
      doc.setFont("helvetica", "normal");
      doc.text(
        "NB: Ce devis est valable 30 jour(s) à partir de la date de création.",
        pageWidth / 2,
        finalY,
        { align: "center" },
      );

      // Final footer on last page
      addFooter();

      // Save PDF
      const fileName =
        type === "QUOTATION"
          ? `Devis_${invoiceNumber}.pdf`
          : type === "DELIVERY_NOTE"
            ? `BL_${invoiceNumber}.pdf`
            : type === "SALE_REFUND"
              ? `Avoir_${invoiceNumber}.pdf`
              : `Facture_${invoiceNumber}.pdf`;

      doc.save(fileName);
    };

    generatePDF();
  };

  /* ================= RENDER ================= */
  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Button
            className="btn-wd btn-outline mr-1 float-left"
            variant="secondary"
            onClick={() => navigate.push("/sale-invoices/list")}
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Retour à la liste
          </Button>

          <Button variant="danger" className="float-right" onClick={exportPDF}>
            <i className="fas fa-file-pdf mr-2"></i>
            Exporter PDF
          </Button>

          {status === "DRAFT" && (
            <Button
              variant="warning"
              className="float-right mr-2"
              onClick={() => navigate.push(`/sale-invoices/edit/${id}`)}
            >
              <i className="fas fa-edit mr-2"></i>
              Modifier
            </Button>
          )}
        </Col>
      </Row>

      <Card className="mt-4 shadow">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <Card.Title as="h4" className="mb-0">
              <i className="fas fa-file-invoice-dollar mr-2"></i>
              {type} - {invoiceNumber}
            </Card.Title>
            <small className="text-light">
              {date} | {status}
            </small>
          </div>
          <div>
            <span className="badge badge-light text-primary p-2">
              <i className="fas fa-euro-sign mr-1"></i>
              {totalTTC.toFixed(3)} TND
            </span>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Company and Client Info */}
          <Row className="mb-4">
            <Col md="6">
              <Card className="border-primary">
                <Card.Header className="bg-light">
                  <h6 className="mb-0 text-primary">
                    <i className="fas fa-store mr-2"></i>
                    Vendeur
                  </h6>
                </Card.Header>
                <Card.Body>
                  <p className="mb-1">
                    <strong>{companyInfo.name}</strong>
                  </p>
                  <p className="mb-1">{companyInfo.address}</p>
                  <p className="mb-1">{companyInfo.city}</p>
                  <p className="mb-1">
                    <i className="fas fa-phone-alt mr-2 text-muted"></i>
                    {companyInfo.phone}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-envelope mr-2 text-muted"></i>
                    {companyInfo.email}
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md="6">
              <Card className="border-primary">
                <Card.Header className="bg-light">
                  <h6 className="mb-0 text-primary">
                    <i className="fas fa-user mr-2"></i>
                    Client
                  </h6>
                </Card.Header>
                <Card.Body>
                  <p className="mb-1">
                    <strong>{clientDetails?.name || "Nom du client"}</strong>
                  </p>
                  <p className="mb-1">{clientDetails?.address || "Adresse"}</p>
                  <p className="mb-1">
                    {clientDetails?.postalCode || ""}{" "}
                    {clientDetails?.city || "Ville"}
                  </p>
                  <p className="mb-1">
                    <i className="fas fa-phone-alt mr-2 text-muted"></i>
                    {clientDetails?.phone || "Non renseigné"}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-envelope mr-2 text-muted"></i>
                    {clientDetails?.email || "Email non renseigné"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Invoice Items */}
          <Row>
            <Col md="12">
              <div className="table-responsive">
                <Table striped hover className="table-invoice">
                  <thead className="thead-dark">
                    <tr>
                      <th>Produit</th>
                      <th className="text-center">Rem %</th>
                      <th className="text-center">Quantité</th>
                      <th className="text-right">Prix unitaire HT</th>
                      <th className="text-center">TVA</th>
                      <th className="text-right">Montant HT</th>
                      <th className="text-right">Montant TVA</th>
                      <th className="text-right">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.length > 0 ? (
                      invoiceItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="mr-3 text-primary">
                                <i className="fas fa-cube"></i>
                              </div>
                              <div>
                                <strong>{item.productName}</strong>
                                <br />
                                <small className="text-muted">
                                  Réf: {item.productId}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center align-middle">
                            {item.rem}%
                          </td>
                          <td className="text-center align-middle">
                            <span className="badge badge-primary p-2">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-right align-middle">
                            {item.price.toFixed(3)} DT
                          </td>
                          <td className="text-center align-middle">
                            <span
                              className={`badge ${
                                item.vatRate === 0
                                  ? "badge-secondary"
                                  : item.vatRate <= 10
                                    ? "badge-info"
                                    : "badge-warning"
                              }`}
                            >
                              {item.vatRate}%
                            </span>
                          </td>
                          <td className="text-right align-middle">
                            {item.totalHT.toFixed(3)} DT
                          </td>
                          <td className="text-right align-middle">
                            {item.vatAmount.toFixed(3)} DT
                          </td>
                          <td className="text-right align-middle font-weight-bold text-primary">
                            {item.totalTTC.toFixed(3)} DT
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
                          <i className="fas fa-exclamation-circle fa-2x mb-3"></i>
                          <p>Aucun article dans cette facture</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

          {/* Totals and Payment Info */}
          <Row className="mt-5">
            <Col md="6">
              <Card className="border-light">
                <Card.Header className="bg-light">
                  <h6 className="mb-0 text-primary">
                    <i className="fas fa-info-circle mr-2"></i>
                    Informations de paiement
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md="6">
                      <p className="mb-2">
                        <small className="text-muted">Mode de paiement</small>
                        <br />
                        <strong>Virement bancaire</strong>
                      </p>
                      <p className="mb-0">
                        <small className="text-muted">Date d'échéance</small>
                        <br />
                        <strong>
                          {(() => {
                            const dueDate = new Date(date);
                            dueDate.setDate(dueDate.getDate() + 30);
                            return dueDate.toLocaleDateString("fr-FR");
                          })()}
                        </strong>
                      </p>
                    </Col>
                    <Col md="6">
                      <p className="mb-2">
                        <small className="text-muted">IBAN</small>
                        <br />
                        <strong>FR76 1234 5678 9012 3456 7890 123</strong>
                      </p>
                      <p className="mb-0">
                        <small className="text-muted">BIC</small>
                        <br />
                        <strong>ABCDEDFXXX</strong>
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md="6">
              <Card className="bg-light border-primary">
                <Card.Body>
                  <Row>
                    <Col md="6" className="text-right">
                      <p className="mb-2">
                        <strong>Total HT :</strong>
                      </p>
                      <p className="mb-2">
                        <strong>Total TVA :</strong>
                      </p>
                      <p className="mb-0 h5">
                        <strong>Total TTC :</strong>
                      </p>
                    </Col>
                    <Col md="6" className="text-right">
                      <p className="mb-2">{totalHT.toFixed(3)} DT</p>
                      <p className="mb-2">{totalVAT.toFixed(3)} DT</p>
                      <p className="mb-0 h4 text-primary font-weight-bold">
                        {totalTTC.toFixed(3)} DT
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notes */}
          {type === "QUOTATION" && (
            <Row className="mt-3">
              <Col md="12">
                <Card className="border-warning">
                  <Card.Header className="bg-warning text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Note importante
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-0">
                      Ce devis est valable 30 jours à compter de sa date
                      d'émission. Les prix sont exprimés en dinars hors taxes.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Card.Body>

        <Card.Footer className="bg-light text-center">
          <Button
            variant="secondary"
            onClick={() => navigate.push("/sale-invoices/list")}
            className="mr-3"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Retour à la liste
          </Button>

          <Button variant="primary" onClick={exportPDF} className="mr-3">
            <i className="fas fa-print mr-2"></i>
            Imprimer
          </Button>

          <Button variant="success" onClick={exportPDF}>
            <i className="fas fa-download mr-2"></i>
            Télécharger PDF
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default SaleInvoiceDetails;
