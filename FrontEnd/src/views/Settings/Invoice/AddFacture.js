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
  addFactureWithLigneFactures,
  updateFactureWithLigneFactures,
  getFactureWithLigneFactures,
} from "../../Redux/factureReduce";
import { getProduits } from "../../Redux/produitReduce";
import { getClients } from "../../Redux/clientReduce";
import { getProjets } from "../../Redux/projetReduce";

function AddFacture() {
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

  const [productLines, setProductLines] = useState([]);
  const [projectLines, setProjectLines] = useState([]);
  const [num, setNum] = useState("");
  const [produits, setProduits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [mntTotalHT, setMntTotalHT] = useState(0);
  const [mntTotalTVA, setMntTotalTVA] = useState(0);
  const [mntTotalTTC, setMntTotalTTC] = useState(0);
  const [typeFacture] = useState(1);

  const calculateTotals = useCallback(() => {
    let totalHT = productLines.reduce((total, lf) => total + lf.mnt, 0);
    totalHT += projectLines.reduce((total, lf) => total + lf.mnt, 0);
    const tva = totalHT * 0.19;
    setMntTotalHT(totalHT);
    setMntTotalTVA(tva);
    setMntTotalTTC(totalHT + tva);
  }, [productLines, projectLines]);

  useEffect(() => {
    const fetchData = async () => {
      const [clientRes, produitRes, projectRes] = await Promise.all([
        dispatch(getClients()),
        dispatch(getProduits()),
        dispatch(getProjets()),
      ]);
      setClients(clientRes.payload.data);
      setProduits(produitRes.payload.data);
      setProjects(projectRes.payload.data);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const fetchFacture = async () => {
        const response = await dispatch(getFactureWithLigneFactures(id));
        const { num, date, ligneFactures, client } = response.payload;
        setNum(num);
        setDate(date);
        setClient({
          value: client.id,
          label: client.name,
          client: client,
        });

        setProductLines(
          ligneFactures
            .filter((lf) => lf.produitId)
            .map((lf) => ({
              produitId: lf.produitId,
              qte: lf.qte,
              pu: lf.pu,
              mnt: lf.pu * lf.qte,
            }))
        );

        setProjectLines(
          ligneFactures
            .filter((lf) => lf.projectId)
            .map((lf) => ({
              projetId: lf.projectId,
              pu: lf.pu,
              qte: lf.qte,
              mnt: lf.pu * lf.qte,
            }))
        );
      };
      fetchFacture();
    }
  }, [id, dispatch]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Function to handle product line changes
  const handleProductLineChange = (index, field, value) => {
    const newProductLines = productLines.map((line, i) => {
      if (i === index) {
        const updatedLine = { ...line, [field]: value };

        // Automatically set pu when a product is selected
        if (field === "produitId") {
          const selectedProduct = produits.find((p) => p.id === value);
          updatedLine.pu = selectedProduct ? selectedProduct.price : 0; // Use the pu from the selected product
        }

        updatedLine.mnt = updatedLine.pu * updatedLine.qte; // Calculate the amount
        return updatedLine;
      }
      return line;
    });
    setProductLines(newProductLines);
    calculateTotals();
  };

  // Function to handle project line changes
  const handleProjectLineChange = (index, field, value) => {
    const newProjectLines = projectLines.map((line, i) => {
      if (i === index) {
        const updatedLine = { ...line, [field]: value };

        // Automatically set pu when a project is selected
        if (field === "projetId") {
          const selectedProject = projects.find((p) => p.id === value);
          updatedLine.pu = selectedProject ? selectedProject.price : 0; // Use the pu from the selected project
        }

        updatedLine.mnt = updatedLine.pu * updatedLine.qte; // Calculate the amount
        return updatedLine;
      }
      return line;
    });
    setProjectLines(newProjectLines);
    calculateTotals();
  };

  const handleAddProductLine = () => {
    setProductLines([
      ...productLines,
      { produitId: "", qte: 0, mnt: 0, pu: 0 },
    ]);
  };

  const handleAddProjectLine = () => {
    setProjectLines([...projectLines, { projetId: "", pu: 0, qte: 0, mnt: 0 }]);
  };

  const handleRemoveProductLine = (index) => {
    const newProductLines = productLines.filter((_, i) => i !== index);
    setProductLines(newProductLines);
    calculateTotals();
  };

  const handleRemoveProjectLine = (index) => {
    const newProjectLines = projectLines.filter((_, i) => i !== index);
    setProjectLines(newProjectLines);
    calculateTotals();
  };

  const submitForm = async () => {
    // Validate form
    if (validator.isEmpty(num)) {
      notify(2, "Numéro de facture est obligatoire");
      return;
    }
    if (!client) {
      notify(2, "Client est obligatoire");
      return;
    }

    const ligneFactures = [
      ...productLines.map((line) => ({
        produitId: line.produitId,
        qte: line.qte,
        pu: line.pu,
        mnt: line.mnt,
      })),
      ...projectLines.map((line) => ({
        projetId: line.projetId,
        qte: line.qte,
        pu: line.pu,
        mnt: line.mnt,
      })),
    ];

    if (ligneFactures.length === 0) {
      notify(2, "Au moins une ligne de produit ou projet est obligatoire");
      return;
    }

    try {
      if (id) {
        const facture = {
          id,
          client: client.client,
          num,
          date,
          ligneFactures,
          mntTotalHT,
          mntTotalTVA,
          mntTotalTTC,
          typeFacture,
        };
        await dispatch(updateFactureWithLigneFactures(facture));

        notify(1, "Facture mise à jour avec succès");
        setTimeout(() => navigate.push("/facture/list"), 1500);
      } else {
        const facture = {
          client: client.client,
          num,
          date,
          ligneFactures,
          mntTotalHT,
          mntTotalTVA,
          mntTotalTTC,
          typeFacture,
        };
        await dispatch(addFactureWithLigneFactures(facture));
        notify(1, "Facture ajoutée avec succès");
        setTimeout(() => navigate.push("/facture/list"), 1500);
      }
    } catch (error) {
      notify(2, "Erreur lors de l'enregistrement de la facture");
    }
  };

  return (
    <Container fluid>
      <ToastContainer />
      <Row>
        <Col md="12">
          <Button
            className="btn-wd btn-outline mr-1 float-left"
            type="button"
            variant="info"
            onClick={() => navigate.push("/facture/list")}
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
              {isNaN(paramId) ? "Ajouter facture" : "Modifier facture"}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="6">
                <Form.Group>
                  <label>Numéro* </label>
                  <Form.Control
                    value={num}
                    placeholder="num"
                    onChange={(e) => setNum(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group>
                  <label>Date Création* </label>
                  <Form.Control
                    readOnly
                    value={date}
                    placeholder="date"
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group>
                  <label>Client* </label>
                  <Select
                    placeholder="client"
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
            </Row>
            <br></br>
            {/* Product Lines */}
            <Row>
              <Col md="12">
                <Button
                  variant="success"
                  onClick={handleAddProductLine}
                  className="mb-3"
                >
                  Ajouter produit
                </Button>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Montant</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productLines.map((line, index) => (
                      <tr key={index}>
                        <td>
                          <Select
                            placeholder="produit"
                            value={produits
                              .map((p) => ({
                                label: p.name,
                                value: p.id,
                              }))
                              .find((p) => p.value === line.produitId)}
                            options={produits.map((produit) => ({
                              label: produit.name,
                              value: produit.id,
                            }))}
                            onChange={(e) =>
                              handleProductLineChange(
                                index,
                                "produitId",
                                e.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={line.qte}
                            type="number"
                            onChange={(e) =>
                              handleProductLineChange(
                                index,
                                "qte",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={line.pu}
                            type="number"
                            onChange={(e) =>
                              handleProductLineChange(
                                index,
                                "pu",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>{line.mnt}</td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveProductLine(index)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Project Lines */}
            <Row>
              <Col md="12">
                <Button
                  variant="success"
                  onClick={handleAddProjectLine}
                  className="mb-3"
                >
                  Ajouter projet
                </Button>

                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Projet</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Montant</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectLines.map((line, index) => (
                      <tr key={index}>
                        <td>
                          <Select
                            placeholder="projet"
                            value={projects
                              .map((p) => ({
                                label: p.libelle,
                                value: p.id,
                              }))
                              .find((p) => p.value === line.projetId)}
                            options={projects.map((project) => ({
                              label: project.libelle,
                              value: project.id,
                            }))}
                            onChange={(e) =>
                              handleProjectLineChange(
                                index,
                                "projetId",
                                e.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={line.qte}
                            type="number"
                            onChange={(e) =>
                              handleProjectLineChange(
                                index,
                                "qte",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={line.pu}
                            type="number"
                            onChange={(e) =>
                              handleProjectLineChange(
                                index,
                                "pu",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>{line.mnt}</td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveProjectLine(index)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Totals */}
            {/* <Row>
              <Col md="4">
                <h5>Total HT: {mntTotalHT}</h5>
              </Col>
              <Col md="4">
                <h5>Total TVA (19%): {mntTotalTVA}</h5>
              </Col>
              <Col md="4">
                <h5>Total TTC: {mntTotalTTC}</h5>
              </Col>
            </Row> */}
            <Row>
              <Col md="4">
                <Form.Group>
                  <label>Total HT</label>
                  <Form.Control
                    value={mntTotalHT.toFixed(2)}
                    placeholder="Total HT"
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group>
                  <label>Total TVA</label>
                  <Form.Control
                    value={mntTotalTVA.toFixed(2)}
                    placeholder="Total TVA"
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group>
                  <label>Total TTC</label>
                  <Form.Control
                    value={mntTotalTTC.toFixed(2)}
                    placeholder="Total TTC"
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer>
            <Button
              className="btn-wd btn-outline mr-1 float-left"
              variant="info"
              onClick={submitForm}
            >
              {isNaN(paramId) ? "Enregistrer" : "Modifier"}
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </Container>
  );
}

export default AddFacture;
