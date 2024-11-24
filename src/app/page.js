import React from "react";
import WebcamModel from "./components/WebcamModel";
import { constraints } from "@tensorflow/tfjs";

export default function Page() {
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <img 
                    src="/logo.png" 
                    alt="NIT Delhi Logo" 
                    style={styles.logo} 
                />
                <h1 style={styles.title}>National Institute of Technology Delhi</h1>
                <br/>
            </header>
            <div style={styles.bgContain}>
            <WebcamModel />
            </div>
        </div>
    );
}

const styles = {
  bgContain:{
    backgroundColor:"red",
  },
    container: {
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#007BFF",
        color: "white",
        borderBottom: "2px solid #0056b3",
    },
    logo: {
        height: "80px",
        marginRight: "20px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        margin: 0,
    },
};
