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
            <div className="forgotpass-left">
                <h1>SPORT!FY</h1>
                <p>Reset your password and get back to the game!</p>
            </div>

            <div className="forgotpass-right">
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
    );
}
