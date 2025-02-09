import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Forgotpass.css"; // Ensure this CSS file exists

export default function Forgotpass() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleResetPassword = (e) => {
        e.preventDefault();
        console.log("Reset link sent to:", email);
        alert("Password reset link has been sent to your email.");
    };

    return (
        <div className="forgotpass-container">
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
                <div style={{ backgroundColor: "black", width: '32%', padding: "50px", opacity: "80%", color: "white", alignContent: "center", textAlign: "center", justifyContent: "center" }} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">

                    <div className="relative z-10 text-center">
                        <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}><i>SPORT!FY</i></h1>
                        <p style={{ fontSize: "20px" }}>
                            Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
                        </p>
                    </div>
                </div>

                <div style={{ flex: 1, }} className="forgotpass-right">
                    <form className="forgotpass-box" onSubmit={handleResetPassword}>
                        <h2>Reset Password</h2>

                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="button-container">
                            <button type="button" className="cancel-button" onClick={() => navigate("/login")}>
                                Cancel
                            </button>
                            <button type="submit" className="reset-button">
                                Reset Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
