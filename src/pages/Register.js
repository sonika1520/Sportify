import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Validate Email
    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (!validatePassword(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long, include an uppercase, lowercase, number, and a special character."
      );
    } else {
      setPasswordError("");
    }
  };

  // Handle Confirm Password Change
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const isDisabled = !email || emailError|| 
  !password || passwordError ||
  !confirmPassword ||  confirmPasswordError;
  return (
    <div style={{
      backgroundImage: "url('/sports.jpg')", backgroundSize: "cover", width: '100vw',
      height: '100vh', backgroundPosition: 'center',

    }} >
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
        {/* Left Section with Branding & Background */}
        <div style={{ backgroundColor:"black",width: '40%', opacity:"80%",color: "white",textAlign: "center"}} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">
          <div
            className="absolute inset-0 bg-black opacity-50"
            style={{
              backgroundImage: "url('/sports.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-extrabold">SPORT!FY</h1>
            <p className="mt-4 text-lg">
              Connect with friends and the world around you through sports.
            </p>
          </div>
        </div>
        

        {/* Right Section with Sign-Up Form */}
        <div style={{flex:1, justifyContent: "center", alignItems:'center' , textAlign:"center"}} >
          <div style={{backgroundColor:"white", margin:"200px"}}>
            <div style={{paddingTop:"20px"}}><h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2></div>

            {/* Sign-Up Form */}
            <form style={{display:"flex", flexDirection:"column"}}>
              <div style={{flex:2, marginBottom:"10px"}}><label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
              />{emailError && <p className="text-red-500 text-sm">{emailError}</p>}
              </div>

              <div style={{flex:2, marginBottom:"10px"}}><label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                className="border rounded-md focus:outline-none "
              /> {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}</div>

              <div style={{flex:2, marginBottom:"10px"}}><label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                className="border rounded-md"
              />{confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}</div>

              {/* Register Button */}
              <div><button disabled={isDisabled} onClick={(e)=>{e.preventDefault();navigate("/Profile")}}>Register</button></div>

              {/* Login Link */}
              <p className="text-gray-600 text-sm text-center mt-4">
                Already a user? <a href="/login" className="text-black font-medium">Log in here</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}