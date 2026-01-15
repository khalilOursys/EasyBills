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

      // Map invoice items with VAT calculation
      setInvoiceItems(
        (data.items || []).map((item) => {
          const product =
            productsRes.payload?.find((p) => p.id === item.productId) || {};
          const itemHT = item.price * item.quantity;
          const itemVAT = item.vatRate ? itemHT * (item.vatRate / 100) : 0;
          const vatRate = item.vatRate || (data.type === "QUOTATION" ? 0 : 19);

          return {
            productId: item.productId,
            productName: product?.name || "Produit inconnu",
            quantity: item.quantity,
            price: item.price,
            vatRate: vatRate,
            vatAmount: item.vatAmount || itemVAT,
            totalHT: itemHT,
            totalTTC: itemHT + itemVAT,
          };
        })
      );
    };

    loadData();
  }, [dispatch, id]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <Badge variant="success">Payée</Badge>;
      case "VALIDATED":
        return <Badge variant="info">Validée</Badge>;
      case "DRAFT":
        return <Badge variant="warning">Brouillon</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "QUOTATION":
        return "Devis";
      case "DELIVERY_NOTE":
        return "Bon de livraison";
      case "SALE_INVOICE":
        return "Facture vente";
      case "SALE_REFUND":
        return "Avoir client";
      default:
        return type;
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 152, 219]; // Light blue

    /* ================= HEADER ================= */
    // Logo
    doc.addImage(logo, "PNG", 14, 10, 40, 15);

    // Invoice title based on type
    const invoiceTitle = getTypeLabel(type).toUpperCase();
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text(invoiceTitle, 160, 20, { align: "right" });

    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° : ${invoiceNumber}`, 160, 28, { align: "right" });
    doc.text(`Date : ${date}`, 160, 33, { align: "right" });
    doc.text(`Statut : ${status}`, 160, 38, { align: "right" });

    /* ================= SELLER (YOUR COMPANY) ================= */
    const sellerY = 55;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text("VOTRE ENTREPRISE", 14, sellerY);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, sellerY + 2, 60, sellerY + 2);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(companyInfo.name, 14, sellerY + 10);
    doc.text(companyInfo.address, 14, sellerY + 15);
    doc.text(companyInfo.city, 14, sellerY + 20);
    doc.text(`Tél: ${companyInfo.phone}`, 14, sellerY + 25);
    doc.text(companyInfo.email, 14, sellerY + 30);
    doc.text(`SIRET: ${companyInfo.siret}`, 14, sellerY + 35);
    doc.text(`TVA: ${companyInfo.vatNumber}`, 14, sellerY + 40);

    /* ================= CLIENT INFO ================= */
    const clientY = 55;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text("CLIENT", 120, clientY);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(120, clientY + 2, 150, clientY + 2);

    // Client box with border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(118, clientY + 5, 78, 45);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(clientDetails?.name || "Nom du client", 122, clientY + 12);
    doc.text(clientDetails?.address || "Adresse", 122, clientY + 17);
    doc.text(clientDetails?.city || "Ville", 122, clientY + 22);
    doc.text(clientDetails?.country || "France", 122, clientY + 27);
    doc.text(
      `Tél: ${clientDetails?.phone || "Non renseigné"}`,
      122,
      clientY + 32
    );
    doc.text(clientDetails?.email || "Email non renseigné", 122, clientY + 37);
    doc.text(
      `TVA: ${clientDetails?.vatNumber || "Non applicable"}`,
      122,
      clientY + 42
    );

    /* ================= INVOICE ITEMS TABLE ================= */
    const tableY = 115;

    // Table header with background
    doc.setFillColor(...primaryColor);
    doc.rect(14, tableY - 7, 182, 8, "F");

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", 16, tableY);
    doc.text("QTÉ", 120, tableY, { align: "center" });
    doc.text("P.U. HT", 140, tableY, { align: "right" });
    doc.text("TVA %", 155, tableY, { align: "center" });
    doc.text("MONTANT HT", 180, tableY, { align: "right" });

    // Table rows
    let currentY = tableY + 10;
    invoiceItems.forEach((item, index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, currentY - 4, 182, 8, "F");
      }

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      // Product name (with line break if too long)
      const productName = item.productName;
      if (productName.length > 40) {
        doc.text(productName.substring(0, 40) + "...", 16, currentY);
      } else {
        doc.text(productName, 16, currentY);
      }

      doc.text(item.quantity.toString(), 120, currentY, { align: "center" });
      doc.text(`${item.price.toFixed(2)} €`, 140, currentY, { align: "right" });
      doc.text(`${item.vatRate}%`, 155, currentY, { align: "center" });
      doc.text(`${item.totalHT.toFixed(2)} €`, 180, currentY, {
        align: "right",
      });

      currentY += 10;
    });

    /* ================= TOTALS SECTION ================= */
    const totalsY = Math.max(currentY + 20, 220);

    // Payment terms on left
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("CONDITIONS", 14, totalsY);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.3);
    doc.line(14, totalsY + 2, 50, totalsY + 2);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Mode de paiement :", 14, totalsY + 10);
    doc.text("Virement bancaire", 60, totalsY + 10);

    doc.text("Date d'échéance :", 14, totalsY + 16);
    // Calculate due date (30 days from invoice date)
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toLocaleDateString("fr-FR");
    doc.text(dueDateStr, 60, totalsY + 16);

    doc.text("IBAN :", 14, totalsY + 22);
    doc.text("FR76 1234 5678 9012 3456 7890 123", 60, totalsY + 22);

    doc.text("BIC :", 14, totalsY + 28);
    doc.text("ABCDEDFXXX", 60, totalsY + 28);

    // Totals box on right
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(130, totalsY - 5, 62, 40, 3, 3, "F");

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(130, totalsY - 5, 62, 40, 3, 3);

    doc.setFontSize(10);
    doc.text("Total HT :", 132, totalsY + 5);
    doc.text(`${totalHT.toFixed(2)} €`, 188, totalsY + 5, { align: "right" });

    doc.text("Total TVA :", 132, totalsY + 13);
    doc.text(`${totalVAT.toFixed(2)} €`, 188, totalsY + 13, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text("Total TTC :", 132, totalsY + 25);
    doc.text(`${totalTTC.toFixed(2)} €`, 188, totalsY + 25, { align: "right" });

    /* ================= FOOTER ================= */
    const footerY = 280;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    doc.line(14, footerY - 5, 196, footerY - 5);

    doc.text("En votre aimable règlement", 105, footerY, { align: "center" });
    doc.text(companyInfo.name, 105, footerY + 5, { align: "center" });
    doc.text(
      `Tél: ${companyInfo.phone} | Email: ${companyInfo.email}`,
      105,
      footerY + 10,
      { align: "center" }
    );

    /* ================= SAVE PDF ================= */
    const fileName =
      type === "QUOTATION"
        ? `Devis_${invoiceNumber}.pdf`
        : `Facture_Vente_${invoiceNumber}.pdf`;
    doc.save(fileName);
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
              {getTypeLabel(type)} - {invoiceNumber}
            </Card.Title>
            <small className="text-light">
              {date} | {getStatusBadge(status)}
            </small>
          </div>
          <div>
            <span className="badge badge-light text-primary p-2">
              <i className="fas fa-euro-sign mr-1"></i>
              {totalTTC.toFixed(2)} €
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
                            <span className="badge badge-primary p-2">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-right align-middle">
                            {item.price.toFixed(2)} €
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
                            {item.totalHT.toFixed(2)} €
                          </td>
                          <td className="text-right align-middle">
                            {item.vatAmount.toFixed(2)} €
                          </td>
                          <td className="text-right align-middle font-weight-bold text-primary">
                            {item.totalTTC.toFixed(2)} €
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
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
                      <p className="mb-2">{totalHT.toFixed(2)} €</p>
                      <p className="mb-2">{totalVAT.toFixed(2)} €</p>
                      <p className="mb-0 h4 text-primary font-weight-bold">
                        {totalTTC.toFixed(2)} €
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
                      d'émission. Les prix sont exprimés en euros hors taxes.
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
