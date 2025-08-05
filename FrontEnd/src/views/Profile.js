import React,{useCallback} from "react";
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { profilUpdated,verification } from "../Redux/usersReduce";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile({obj}) {
  const notify = (type,msg) => {
    if(type === 1)
      toast.success(<strong><i className="fas fa-check-circle"></i>{msg}</strong>);
    else 
      toast.error(<strong><i className="fas fa-exclamation-circle"></i>{msg}</strong>);
  }
  const dispatch = useDispatch();
  var id = obj.user.id;
  const [nom, setNom] = React.useState(obj.user.nom_prenom);
  const [tel, setTel] = React.useState(obj.user.tel);
  const [login, setLogin] = React.useState(obj.user.login);
  const [password, setPassword] = React.useState("");
  function submitForm(event) {
    if (
      nom === "" ||
      login === "" ||
      (password !== "" && password.length < 6)
    ) {
      notify(2, "Toutes les données sont obligatoires");
    } else {
      notify(1, "Modifier avec succes");
      dispatch(profilUpdated({ nom, tel, login, password, id }));
    }
  }

  //verif token
  const verifToken = useCallback(async () => {
    verifToken();
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  React.useEffect(() => {
  }, [verifToken]);
  return (
    <>
      <ToastContainer />
      <Container fluid>
        <div className="section-image" >
          <Container>
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">Mon profil</Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
          
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Nom* </label>
                            <Form.Control
                              defaultValue={nom}
                              placeholder="Nom"
                              type="text"
                              onChange={(value) => {
                                setNom(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Telephone </label>
                            <Form.Control
                              defaultValue={tel}
                              placeholder="Telephone"
                              type="text"
                              onChange={(value) => {
                                setTel(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Login*</label>
                            <Form.Control
                              id="Login_user"
                              defaultValue={login}
                              placeholder="Login"
                              type="text"
                              onChange={(value) => {
                                setLogin(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Mot de passe* (6 chiffre minimum)</label>
                            <Form.Control
                              id="mdp_user"
                              defaultValue=""
                              placeholder="Mote de passe"
                              type="password"
                              onChange={(value) => {
                                setPassword(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        onClick={submitForm}
                      >
                        Enregistrer
                      </Button>
                      <div className="clearfix"></div>
                    </Card.Body>
                  </Card>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      </Container>
    </>
  );
}

export default Profile;
