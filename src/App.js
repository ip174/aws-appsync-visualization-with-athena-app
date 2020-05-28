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
import { Bar } from "react-chartjs-2";

Amplify.configure(awsconfig);

const App = () => {
  const [user, setUser] = useState(null);
  let [styles, setStyles] = useState({ display: "none" });
  let [messageUpload, setMessageUpload] = useState();
  let [dataStats, setDataStats] = useState();
  let [dataPrediction, setDataPrediction] = useState();

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

    let tmp_america = [];
    let tmp_europe = [];
    let tmp_eu = [];
    let tmp_eu15 = [];
    let tmp_othereu = [];
    let tmp_other = [];
    let tmp_total = [];

    await d3.csv(file.name, function (data) {
      if (data.country !== "" && data.tourists !== "") {
        if (data.country === "America") {
          tmp_america.push(data.tourists);
        } else if (data.country === "Europe") {
          tmp_europe.push(data.tourists);
        } else if (data.country === "EU") {
          tmp_eu.push(data.tourists);
        } else if (data.country === "EU15") {
          tmp_eu15.push(data.tourists);
        } else if (data.country === "OtherEU") {
          tmp_othereu.push(data.tourists);
        } else if (data.country === "Other") {
          tmp_other.push(data.tourists);
        } else if (data.country === "Total") {
          tmp_total.push(data.tourists);
        }
      }
    });

    let data = getData(
      tmp_america.map(Number),
      tmp_europe.map(Number),
      tmp_eu.map(Number),
      tmp_eu15.map(Number),
      tmp_othereu.map(Number),
      tmp_other.map(Number),
      tmp_total.map(Number)
    );

    let predictionData = getPredictionData(
      tmp_america.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length,
      tmp_europe.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length,
      tmp_eu.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length,
      tmp_eu15.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length,
      tmp_othereu.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length,
      tmp_other.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length,
      tmp_total.map(Number).reduce((a, b) => a + b, 0) / tmp_america.length
    );

    setDataStats(data);
    setDataPrediction(predictionData);

    Storage.put(file.name, file)
      .then((result) => {
        let resp = file.name + " was succesfully uploaded to S3...";
        setMessageUpload(resp);
        setStyles({ display: "block" });
      })
      .catch((err) => console.log(err));
  };

  let getData = (
    dataAmerica,
    dataEurope,
    dataEu,
    dataEU15,
    dataOtherEU,
    dataOther,
    dataTotal
  ) => {
    return {
      labels: ["2016", "2017", "2018", "2019"],
      datasets: [
        {
          label: "America",
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataAmerica,
        },
        {
          label: "Europe",
          backgroundColor: "rgba(122,23,121,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(205,99,132,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataEurope,
        },
        {
          label: "EU",
          backgroundColor: "rgba(255,242,100,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(12,9,201,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataEu,
        },
        {
          label: "EU15",
          backgroundColor: "rgba(20,101,190,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataEU15,
        },
        {
          label: "OtherEU",
          backgroundColor: "rgba(20,232,2,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataOtherEU,
        },
        {
          label: "Other",
          backgroundColor: "rgba(43,10,90,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataOther,
        },
        {
          label: "Total",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: dataTotal,
        },
      ],
    };
  };

  let getPredictionData = (
    dataAmerica,
    dataEurope,
    dataEu,
    dataEU15,
    dataOtherEU,
    dataOther,
    dataTotal
  ) => {
    return {
      labels: ["+1", "+2", "+3"],
      datasets: [
        {
          label: "America",
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataAmerica],
        },
        {
          label: "Europe",
          backgroundColor: "rgba(122,23,121,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(205,99,132,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataEurope],
        },
        {
          label: "EU",
          backgroundColor: "rgba(255,242,100,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(12,9,201,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataEu],
        },
        {
          label: "EU15",
          backgroundColor: "rgba(20,101,190,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataEU15],
        },
        {
          label: "OtherEU",
          backgroundColor: "rgba(20,232,2,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataOtherEU],
        },
        {
          label: "Other",
          backgroundColor: "rgba(43,10,90,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataOther],
        },
        {
          label: "Total",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderColor: "rgba(201, 201, 201)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(222,99,221,0.8)",
          hoverBorderColor: "rgba(201, 201, 201)",
          data: [dataTotal],
        },
      ],
    };
  };

  let styleMainBox = {
    background: "#f8f9fa",
  };

  return (
    <>
      <Container className="mb-5 main-box pb-5" style={styleMainBox}>
        <Navbar bg="light" variant="dark" className="border-bottom">
          <Navbar.Brand href="#home">
            <img src="/logobg.png" width="125" />
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home" className="text-dark">
              Home
            </Nav.Link>
          </Nav>
          <Form inline>
            <Button variant="btn" className="text-dark" onClick={signOut}>
              Logout
            </Button>
          </Form>
        </Navbar>
        <Row className="mt-5">
          <Col>
            <Form>
              <h4>Import a CSV file to start</h4>
              <input
                type="file"
                id="file"
                onChange={(e) => {
                  uploadFile(e);
                }}
              />
              <p id="messageUpload" className="mt-3">
                {messageUpload}
              </p>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <hr />
          </Col>
        </Row>
        <Row className="mt-3 charData" style={styles}>
          <Col>
            <h2>Travel Stats</h2>
            <Bar data={dataStats} width={100} height={40} />
          </Col>
        </Row>

        <Row className="mt-5 charData" style={styles}>
          <Col>
            <h2>Future Predictions</h2>
            <Bar data={dataPrediction} width={100} height={40} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withAuthenticator(App);
