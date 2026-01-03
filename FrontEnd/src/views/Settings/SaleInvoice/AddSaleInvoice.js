import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import validator from "validator";
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import {
  addSaleInvoice,
  updateSaleInvoice,
  getSaleInvoice,
} from "../../../Redux/saleInvoiceSlice";
import { fetchProducts } from "../../../Redux/productsSlice";
import { fetchClients } from "../../../Redux/clientsSlice";

function AddSaleInvoice() {
  const notify = (type, msg) => {
    toast(
      <strong>
        <i
          className={`fas ${
            type === 1 ? "fa-check-circle" : "fa-exclamation-circle"
          }`}
        ></i>
        {msg}
      </strong>,
      { type: type === 1 ? toast.TYPE.SUCCESS : toast.TYPE.ERROR }
    );
  };

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
  const [date, setDate] = useState(dateString);

  const dispatch = useDispatch();
  const navigate = useHistory();
  const { id: paramId } = useParams();
  const id = !isNaN(paramId) ? paramId : null;

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);
  const [type, setType] = useState("SALE_INVOICE");
  const [status, setStatus] = useState("DRAFT");

  const calculateTotals = useCallback(() => {
    let ht = 0;
    let vat = 0;
    let ttc = 0;

    invoiceItems.forEach((item) => {
      const itemHT = item.price * item.quantity;
      const itemVAT = itemHT * (item.vatRate / 100);
      const itemTTC = itemHT + itemVAT;

      ht += itemHT;
      vat += itemVAT;
      ttc += itemTTC;
    });

    setTotalHT(ht);
    setTotalVAT(vat);
    setTotalTTC(ttc);
  }, [invoiceItems]);

  useEffect(() => {
    const fetchData = async () => {
      const [clientRes, productRes] = await Promise.all([
        dispatch(fetchClients()),
        dispatch(fetchProducts()),
      ]);
      setClients(clientRes.payload || []);
      setProducts(productRes.payload || []);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        const response = await dispatch(getSaleInvoice(id));
        const data = response.payload;
        setInvoiceNumber(data.invoiceNumber);
        setDate(data.date.split("T")[0]);
        setType(data.type);
        setStatus(data.status);
        setTotalHT(data.totalHT);
        setTotalTTC(data.totalTTC);

        setClient({
          value: data.client.id,
          label: data.client.name,
          client: data.client,
        });

        setInvoiceItems(
          data.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            totalHT: item.price * item.quantity,
            totalTTC: item.price * item.quantity * (1 + item.vatRate / 100),
          }))
        );
      };
      fetchInvoice();
    }
  }, [id, dispatch]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleItemChange = (index, field, value) => {
    const newItems = invoiceItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        if (field === "productId") {
          const selectedProduct = products.find((p) => p.id === value);
          if (selectedProduct) {
            updatedItem.price =
              selectedProduct.salePrice || selectedProduct.price || 0;
          }
        }

        // Calculate item totals
        const itemHT = updatedItem.price * updatedItem.quantity;
        const itemVAT = itemHT * (updatedItem.vatRate / 100);

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
        vatRate: 19,
        vatAmount: 0,
        totalHT: 0,
        totalTTC: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  const submitForm = async () => {
    // Validate form
    if (validator.isEmpty(invoiceNumber)) {
      notify(2, "Numéro de facture est obligatoire");
      return;
    }
    if (!client) {
      notify(2, "Client est obligatoire");
      return;
    }
    if (invoiceItems.length === 0) {
      notify(2, "Au moins un article est obligatoire");
      return;
    }

    const items = invoiceItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      vatRate: item.vatRate,
      vatAmount: item.vatAmount,
    }));

    try {
      const invoiceData = {
        invoiceNumber,
        date,
        type,
        status,
        clientId: client.value,
        items,
        totalHT,
        totalTTC,
      };

      if (id) {
        await dispatch(updateSaleInvoice({ id, ...invoiceData }));
        notify(1, "Facture de vente mise à jour avec succès");
      } else {
        await dispatch(addSaleInvoice(invoiceData));
        notify(1, "Facture de vente ajoutée avec succès");
      }

      setTimeout(() => navigate.push("/sale-invoices/list"), 1500);
    } catch (error) {
      notify(2, "Erreur lors de l'enregistrement de la facture");
    }
  };

  const typeOptions = [
    { value: "QUOTATION", label: "Devis" },
    { value: "DELIVERY_NOTE", label: "Bon de livraison" },
    { value: "SALE_INVOICE", label: "Facture vente" },
    { value: "SALE_REFUND", label: "Avoir client" },
  ];

  const statusOptions = [
    { value: "DRAFT", label: "Brouillon" },
    { value: "VALIDATED", label: "Validée" },
    { value: "PAID", label: "Payée" },
    { value: "CANCELLED", label: "Annulée" },
  ];

  const vatRateOptions = [
    { value: 0, label: "0%" },
    { value: 5.5, label: "5.5%" },
    { value: 10, label: "10%" },
    { value: 19, label: "19%" },
    { value: 20, label: "20%" },
  ];

  return (
    <Container fluid>
      <ToastContainer />
      <Row>
        <Col md="12">
          <Button
            className="btn-wd btn-outline mr-1 float-left"
            type="button"
            variant="info"
            onClick={() => navigate.push("/sale-invoice/list")}
          >
            <span className="btn-label">
              <i className="fas fa-list"></i>
            </span>
            Retour à la liste
          </Button>
        </Col>
      </Row>
      <Form className="form">
        <Card>
          <Card.Header>
            <Card.Title as="h4">
              {isNaN(paramId)
                ? "Ajouter facture de vente"
                : "Modifier facture de vente"}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="4">
                <Form.Group>
                  <label>Numéro de facture* </label>
                  <Form.Control
                    value={invoiceNumber}
                    placeholder="Ex: FAC-2023-001"
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group>
                  <label>Date* </label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group>
                  <label>Type* </label>
                  <Select
                    value={typeOptions.find((opt) => opt.value === type)}
                    options={typeOptions}
                    onChange={(e) => setType(e.value)}
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group>
                  <label>Client* </label>
                  <Select
                    placeholder="Sélectionner un client"
                    value={client}
                    options={clients.map((client) => ({
                      label: client.name,
                      value: client.id,
                      client: client,
                    }))}
                    onChange={(e) => setClient(e)}
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group>
                  <label>Statut </label>
                  <Select
                    value={statusOptions.find((opt) => opt.value === status)}
                    options={statusOptions}
                    onChange={(e) => setStatus(e.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <br></br>

            {/* Items Table */}
            <Row>
              <Col md="12">
                <Button
                  variant="success"
                  onClick={handleAddItem}
                  className="mb-3"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Ajouter un article
                </Button>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix unitaire (€)</th>
                      <th>TVA %</th>
                      <th>Montant TVA (€)</th>
                      <th>Total HT (€)</th>
                      <th>Total TTC (€)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Select
                            placeholder="Sélectionner un produit"
                            value={products
                              .map((p) => ({
                                label: p.name,
                                value: p.id,
                              }))
                              .find((p) => p.value === item.productId)}
                            options={products.map((product) => ({
                              label: product.name,
                              value: product.id,
                            }))}
                            onChange={(e) =>
                              handleItemChange(index, "productId", e.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={item.quantity}
                            type="number"
                            min="1"
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={item.price}
                            type="number"
                            step="0.01"
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </td>
                        <td>
                          <Select
                            value={vatRateOptions.find(
                              (opt) => opt.value === item.vatRate
                            )}
                            options={vatRateOptions}
                            onChange={(e) =>
                              handleItemChange(index, "vatRate", e.value)
                            }
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: "38px",
                                height: "38px",
                              }),
                            }}
                          />
                        </td>
                        <td>{item.vatAmount?.toFixed(2) || "0.00"}</td>
                        <td>{item.totalHT?.toFixed(2) || "0.00"}</td>
                        <td>{item.totalTTC?.toFixed(2) || "0.00"}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Totals */}
            <Row className="mt-3">
              <Col md="3" className="offset-md-6">
                <Form.Group>
                  <label>Total HT (€)</label>
                  <Form.Control
                    value={totalHT.toFixed(2)}
                    placeholder="Total HT"
                    readOnly
                    className="text-right"
                  />
                </Form.Group>
              </Col>
              <Col md="3">
                <Form.Group>
                  <label>Total TVA (€)</label>
                  <Form.Control
                    value={totalVAT.toFixed(2)}
                    placeholder="TVA"
                    readOnly
                    className="text-right"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="3" className="offset-md-9">
                <Form.Group>
                  <label>Total TTC (€)</label>
                  <Form.Control
                    value={totalTTC.toFixed(2)}
                    placeholder="Total TTC"
                    readOnly
                    className="text-right font-weight-bold"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer>
            <Button
              className="btn-wd btn-outline mr-1 float-left"
              variant="primary"
              onClick={submitForm}
            >
              {isNaN(paramId) ? "Enregistrer" : "Mettre à jour"}
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </Container>
  );
}

export default AddSaleInvoice;
