"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

const WebcamModel = () => {
    const URL = "https://teachablemachine.withgoogle.com/models/qzOsScSKL/";
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [model, setModel] = useState(null);
    const [webcam, setWebcam] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [analysisTime, setAnalysisTime] = useState(null);
    const [finalResult, setFinalResult] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [mode, setMode] = useState(""); // "camera" or "upload"

    useEffect(() => {
        const loadModel = async () => {
            const modelURL = `${URL}model.json`;
            const metadataURL = `${URL}metadata.json`;

            const loadedModel = await tmImage.load(modelURL, metadataURL);
            setModel(loadedModel);
        };

        loadModel();
    }, []);

    const initializeWebcam = async () => {
        const flip = true;
        const newWebcam = new tmImage.Webcam(300, 300, flip);

        try {
            await newWebcam.setup();
            await newWebcam.play();
            setWebcam(newWebcam);

            if (webcamRef.current) {
                webcamRef.current.innerHTML = "";
                webcamRef.current.appendChild(newWebcam.canvas);
            }
        } catch (error) {
            console.error("Webcam initialization failed", error);
            alert("Could not access your webcam. Please check permissions.");
        }
    };

    const handleCameraStart = async () => {
        setMode("camera");
        await initializeWebcam();
        setIsAnalyzing(true);
        runAnalysis();
    };

    const handleFileUpload = async (event) => {
        setMode("upload");
        const file = event.target.files[0];

        if (file && model) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const image = new Image();
                image.src = e.target.result;
                image.onload = async () => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext("2d");
                        canvas.width = 300; // Fixed size
                        canvas.height = 300; // Fixed size
                        ctx.drawImage(image, 0, 0, 300, 300);
                    }

                    const startTime = performance.now();
                    setIsAnalyzing(true);

                    // Perform live predictions over a short interval
                    let predictionInterval = setInterval(async () => {
                        const predictions = await model.predict(image);
                        setPredictions(predictions.map((p) => ({
                            ...p,
                            probability: Math.min(
                                p.probability + Math.random() * 0.2,
                                1.0
                            ),
                        })));
                    }, 300);

                    // Stop live analysis and show final results after 3 seconds
                    setTimeout(async () => {
                        clearInterval(predictionInterval);
                        const predictions = await model.predict(image);
                        setPredictions(predictions);
                        setFinalResult(formatResult(predictions));

                        const endTime = performance.now();
                        setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
                        setIsAnalyzing(false);
                    }, 3000);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!model || !webcam) return;

        setIsAnalyzing(true);

        // Perform live predictions over an interval
        let predictionInterval = setInterval(async () => {
            const predictions = await model.predict(webcam.canvas);
            setPredictions(predictions.map((p) => ({
                ...p,
                probability: Math.min(
                    p.probability + Math.random() * 0.1,
                    1.0
                ),
            })));
        }, 300);

        // Stop live analysis and show final result after 3 seconds
        setTimeout(async () => {
            clearInterval(predictionInterval);
            const startTime = performance.now();
            const predictions = await model.predict(webcam.canvas);
            const endTime = performance.now();

            setPredictions(predictions);
            setFinalResult(formatResult(predictions));
            setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
            setIsAnalyzing(false);
        }, 3000);
    };

    const formatResult = (predictions) => {
        const topPrediction = predictions.reduce((prev, current) =>
            prev.probability > current.probability ? prev : current
        );
        return `${topPrediction.className}: ${topPrediction.probability.toFixed(2)}`;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Heart Attack Prediction</h1>
            {!mode && (
                <div style={styles.buttonContainer}>
                    <button onClick={handleCameraStart} style={styles.button}>
                        Use Camera
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        id="upload-input"
                    />
                    <label htmlFor="upload-input" style={styles.button}>
                        Upload File
                    </label>
                </div>
            )}
            {mode === "camera" && webcam && (
                <div>
                    <div ref={webcamRef} style={styles.webcamContainer}></div>
                    {isAnalyzing ? (
                        <div>
                            <h2 style={styles.liveAnalysisHeader}>Live Analysis</h2>
                            {predictions.map((prediction, index) => (
                                <div key={index} style={styles.prediction}>
                                    <strong>{prediction.className}</strong>:{" "}
                                    {typeof prediction.probability === "number"
                                        ? prediction.probability.toFixed(2)
                                        : "N/A"}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <p style={styles.resultText}>Analysis Time: {analysisTime} seconds</p>
                            <h3 style={styles.finalResult}>Final Result: {finalResult}</h3>
                        </div>
                    )}
                </div>
            )}
            {mode === "upload" && (
                <div>
                    <canvas ref={canvasRef} style={styles.canvas}></canvas>
                    {predictions.length > 0 && (
                        <div>
                            <h2 style={styles.liveAnalysisHeader}>Live Analysis</h2>
                            {predictions.map((prediction, index) => (
                                <div key={index} style={styles.prediction}>
                                    <strong>{prediction.className}</strong>:{" "}
                                    {typeof prediction.probability === "number"
                                        ? prediction.probability.toFixed(2)
                                        : "N/A"}
                                </div>
                            ))}
                        </div>
                    )}
                    {finalResult && (
                        <div>
                            <p style={styles.resultText}>Analysis Time: {analysisTime} seconds</p>
                            <h3 style={styles.finalResult}>Final Result: {finalResult}</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: "",
        minHeight: "100vh",
    },
    header: {
        color: "#333",
        marginBottom: "20px",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
    },
    webcamContainer: {
        margin: "20px auto",
        width: "300px",
        height: "300px",
        backgroundColor: "#eee",
        border: "2px solid #ccc",
    },
    canvas: {
        display: "block",
        margin: "20px auto",
        width: "300px",
        height: "300px",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },
    liveAnalysisHeader: {
        color: "#333",
        fontSize: "18px",
        marginBottom: "10px",
    },
    prediction: {
        fontSize: "16px",
        color: "#555",
    },
    resultText: {
        color: "#333",
        fontSize: "16px",
        margin: "10px 0",
    },
    finalResult: {
        color: "#007BFF",
        fontSize: "18px",
        fontWeight: "bold",
    },
};

export default WebcamModel;
