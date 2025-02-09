import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Make sure to create this CSS file for styling

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="login-left">
                <h1>SPORT!FY</h1>
                <p>Connect with friends and the world around you on Sportify.</p>
            </div>

            <div className="login-right">
                <div className="login-box">
                    <h2>Sign in</h2>

                    <label>Email</label>
                    <input type="email" placeholder="enter email" />

                    <label>Password</label>
                    <input type="password" placeholder="Password" />

                    <button className="login-button" onClick={() => navigate("/profile")}>
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
    );
}
