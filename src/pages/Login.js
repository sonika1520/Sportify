import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Make sure to create this CSS file for styling

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
                <div style={{ backgroundColor: "black", width: '32%', padding: "50px", opacity: "80%", color: "white", alignContent: "center", textAlign: "center", justifyContent: "center" }} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">

                    <div className="relative z-10 text-center">
                        <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}><i>SPORT!FY</i></h1>
                        <p style={{ fontSize: "20px" }}>
                            Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
                        </p>
                    </div>
                </div>

                <div style={{ flex: 1, }} className="login-right">
                    <div className="login-box">
                        <h2>Sign in</h2>

                        <label>Email</label>
                        <input type="email" placeholder="enter email" />

                        <label>Password</label>
                        <input type="password" placeholder="Password" />

                        <button className="login-button" onClick={() => navigate("/home")}>
                            login
                        </button>

                        <p className="new-user">
                            New user? <span onClick={() => navigate("/register")}>Click here</span>
                        </p>
                        <p className="forgot-password">
                            <span onClick={() => navigate("/forgotpass")}>forgot password</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
