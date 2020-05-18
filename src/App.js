import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation, Storage, Auth } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
  Container,
  Row,
  Col,
} from "react-bootstrap";

import * as d3 from "d3";
import moment from "moment";

import awsconfig from "./aws-exports";
// import CanvasJSReact from "./assets/canvasjs.react";
// //var CanvasJSReact = require('./canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;

Amplify.configure(awsconfig);

const App = () => {
  const [user, setUser] = useState(null);
  const [csvFile] = useState("");

  // get current user
  useEffect(() => {
    if (user) return;
    const getUser = async () => {
      const _user = await Auth.currentAuthenticatedUser();
      setUser(_user);
      console.log(JSON.stringify(_user.attributes, null, 2));
    };
    getUser();
  }, [user]);

  const signOut = () => {
    Auth.signOut()
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    d3.csv("/basic chart.csv")
      .then(function (data) {
        for (var i = 0; i < data.length; i++) {
          console.log(data[i]);
        }
      })
      .catch(function (err) {
        throw err;
      });

    Storage.put(file.name, file)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  };

  const displayCharts = (event) => {};

  return (
    <>
      <Container>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">TravData</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
          </Nav>
          <Form inline>
            <Button variant="light" onClick={signOut}>
              Logout
            </Button>
          </Form>
        </Navbar>
        <Row className="mt-5">
          <Col>
            <Form>
              <input
                type="file"
                id="file"
                onChange={(e) => {
                  uploadFile(e);
                }}
              />
            </Form>
          </Col>
          <Col>
            <Button variant="success" onClick={displayCharts}>
              Query
            </Button>
          </Col>
          <Col></Col>
          <Col></Col>
        </Row>
        <Row className="mt-5">
          <Col></Col>
        </Row>
      </Container>
    </>
  );
};

export default withAuthenticator(App);
