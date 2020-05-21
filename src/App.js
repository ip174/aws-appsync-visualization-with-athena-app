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

  const dataPrediction = {
    labels: ["January 2021", "February 2021", "March 2021"],
    datasets: [
      {
        label: "North America",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [305529596, 351023883, 676728053, 375201195, 81622211],
      },
      {
        label: "Europe",
        backgroundColor: "rgba(122,23,121,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(205,99,132,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [2374823247, 6336760647, 4448673128, 3494956411, 3452135698],
      },
      {
        label: "of which EU",
        backgroundColor: "rgba(255,242,100,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(12,9,201,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [116704115, 1272672514, 3273214954, 238995736, 3353431269],
      },
      {
        label: "of which EU15",
        backgroundColor: "rgba(20,101,190,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(222,99,221,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [396704115, 4272672514, 4673214954, 428995736, 4253431269],
      },
      {
        label: "of which OtherEU",
        backgroundColor: "rgba(20,232,2,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(222,99,221,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [942881407, 1163511429, 1118772447, 1171126536, 1334933273],
      },
      {
        label: "Other Countries",
        backgroundColor: "rgba(43,10,90,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(222,99,221,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [368273372, 263189718, 5181554291, 4213021041, 1123534255],
      },
      {
        label: "Total World",
        backgroundColor: "rgba(0,0,0,0.2)",
        borderColor: "rgba(201, 201, 201)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(222,99,221,0.8)",
        hoverBorderColor: "rgba(201, 201, 201)",
        data: [3348626215, 2550974248, 3306955472, 5883178647, 1957292164],
      },
    ],
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

    console.log(data);
    console.log(dataPrediction);

    setDataStats(data);

    Storage.put(file.name, file)
      .then((result) => {
        let resp = file.name + " was succesfully uploaded to S3...";
        // console.log("Uploaded to S3: ", result);
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

  return (
    <>
      <Container className="mb-5">
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">TravData</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
          </Nav>
          <Form inline>
            <Button variant="btn" className="text-white" onClick={signOut}>
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

        <Row className="mt-5 charData" style={styles}>
          <Col>
            <h2>UK Current Travel Stats</h2>
            <Bar data={dataStats} width={100} height={40} />
          </Col>
        </Row>

        <Row className="mt-5 charData" style={styles}>
          <Col>
            <h2>UK Prediction for 2021</h2>
            <Bar data={dataPrediction} width={100} height={40} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withAuthenticator(App);
